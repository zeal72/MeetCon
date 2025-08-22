"use client";

import { useState, useEffect } from 'react';
import { X, Crown, Mic, MicOff, Video, VideoOff, Users, Wifi, WifiOff, MoreVertical } from 'lucide-react';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';

const ParticipantsListModal = ({ isOpen, onClose, hostId, currentUserId }) => {
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [searchTerm, setSearchTerm] = useState('');

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Parse participant metadata
  const getParticipantInfo = (participant) => {
    let metadata = {};
    try {
      if (participant.metadata) {
        metadata = JSON.parse(participant.metadata);
      }
    } catch (e) {
      console.error('Error parsing participant metadata:', e);
    }

    return {
      name: metadata.name || participant.name || participant.identity,
      avatar: metadata.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(metadata.name || participant.identity)}&background=random&color=fff&size=128`,
      userType: metadata.userType || 'anonymous',
      isAuthenticated: metadata.isAuthenticated || false,
      userId: metadata.userId,
      joinedAt: metadata.joinedAt,
    };
  };

  // Filter participants based on search
  const filteredParticipants = participants.filter(participant => {
    const info = getParticipantInfo(participant);
    return info.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort participants: host first, then alphabetically
  const sortedParticipants = filteredParticipants.sort((a, b) => {
    const aInfo = getParticipantInfo(a);
    const bInfo = getParticipantInfo(b);
    
    // Host comes first
    if (aInfo.userId === hostId && bInfo.userId !== hostId) return -1;
    if (bInfo.userId === hostId && aInfo.userId !== hostId) return 1;
    
    // Then sort alphabetically
    return aInfo.name.localeCompare(bInfo.name);
  });

  const getConnectionQuality = (participant) => {
    // This would need to be implemented based on LiveKit's connection quality API
    // For now, we'll return a random quality for demo purposes
    const qualities = ['excellent', 'good', 'fair', 'poor'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  };

  const getConnectionIcon = (quality) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'fair':
        return <Wifi className="w-4 h-4 text-yellow-400" />;
      case 'poor':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Participants</h2>
              <p className="text-gray-400 text-sm">{participants.length} in meeting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto">
          {sortedParticipants.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No participants found</p>
            </div>
          ) : (
            <div className="p-2">
              {sortedParticipants.map((participant) => {
                const info = getParticipantInfo(participant);
                const isHost = info.userId === hostId;
                const isCurrentUser = participant === localParticipant.participant;
                const connectionQuality = getConnectionQuality(participant);

                return (
                  <div
                    key={participant.identity}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={info.avatar}
                        alt={info.name}
                        className="w-10 h-10 rounded-full border-2 border-gray-600"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(info.name)}&background=6B7280&color=fff&size=128`;
                        }}
                      />
                      {isHost && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {info.isAuthenticated && !isHost && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Participant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium truncate">
                          {info.name}
                          {isCurrentUser && <span className="text-blue-400"> (You)</span>}
                        </h3>
                        {isHost && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                            Host
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          info.userType === 'authenticated' ? 'bg-blue-500/20 text-blue-400' :
                          info.userType === 'guest' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {info.userType === 'authenticated' ? 'Google User' :
                           info.userType === 'guest' ? 'Guest' : 'Participant'}
                        </span>
                        
                        {info.joinedAt && (
                          <span className="text-xs text-gray-500">
                            Joined {new Date(info.joinedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Connection Quality */}
                      <div className="flex items-center space-x-1">
                        {getConnectionIcon(connectionQuality)}
                      </div>

                      {/* Audio Status */}
                      <div className="flex items-center">
                        {participant.isMicrophoneEnabled ? (
                          <Mic className="w-4 h-4 text-green-400" />
                        ) : (
                          <MicOff className="w-4 h-4 text-red-400" />
                        )}
                      </div>

                      {/* Video Status */}
                      <div className="flex items-center">
                        {participant.isCameraEnabled ? (
                          <Video className="w-4 h-4 text-green-400" />
                        ) : (
                          <VideoOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      {/* More options (for host) */}
                      {isHost && !isCurrentUser && (
                        <button className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{participants.length} total participants</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{participants.filter(p => p.isMicrophoneEnabled).length} speaking</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{participants.filter(p => p.isCameraEnabled).length} on video</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsListModal;