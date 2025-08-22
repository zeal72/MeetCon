"use client";

import { useState, useEffect } from 'react';
import { Copy, Users, Share2, Crown, Wifi, WifiOff, Check } from 'lucide-react';
import { useRoomContext, useParticipants } from '@livekit/components-react';

const RoomHeader = ({ roomId, currentUser, onShowParticipants, isHost = false }) => {
  const [copied, setCopied] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const participants = useParticipants();
  const room = useRoomContext();

  // Monitor connection quality
  useEffect(() => {
    if (!room) return;

    const handleConnectionQuality = (quality) => {
      if (quality === 0) setConnectionQuality('poor');
      else if (quality <= 2) setConnectionQuality('fair');
      else setConnectionQuality('good');
    };

    room.on('connectionQualityChanged', handleConnectionQuality);
    return () => {
      room.off('connectionQualityChanged', handleConnectionQuality);
    };
  }, [room]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room ID:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareRoom = async () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my MeetSpace meeting',
          text: `Join my video meeting on MeetSpace`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyMeetingLink(shareUrl);
        }
      }
    } else {
      copyMeetingLink(shareUrl);
    }
  };

  const copyMeetingLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy meeting link:', err);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
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
    <div className="absolute top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Room info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Live Meeting</span>
            {isHost && <Crown className="w-4 h-4 text-yellow-400" />}
          </div>
          
          <div className="hidden sm:flex items-center space-x-2 text-white/70">
            <span className="text-sm">Room:</span>
            <code className="bg-white/10 px-2 py-1 rounded text-sm font-mono">
              {roomId}
            </code>
            <button
              onClick={copyRoomId}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Copy Room ID"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-3">
          {/* Connection quality indicator */}
          <div className="flex items-center space-x-1 text-white/70">
            {getConnectionIcon()}
            <span className="text-sm capitalize hidden sm:inline">
              {connectionQuality}
            </span>
          </div>

          {/* Participants count */}
          <button
            onClick={onShowParticipants}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-white"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">{participants.length}</span>
          </button>

          {/* Share button */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors text-white font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Share dropdown */}
            {showShareMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-10">
                <div className="p-4">
                  <h3 className="text-white font-medium mb-3">Share this meeting</h3>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        shareRoom();
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Share2 className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-white font-medium">Share Link</div>
                          <div className="text-gray-400 text-sm">Send meeting link to others</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        copyRoomId();
                        setShowShareMenu(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Copy className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-white font-medium">Copy Room ID</div>
                          <div className="text-gray-400 text-sm">Share room ID: {roomId}</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default RoomHeader;