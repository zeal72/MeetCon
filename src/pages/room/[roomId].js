// pages/room/[roomId].js - Fixed Room Component
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/Contexts/AuthContext';
import GuestNameModal from '@/components/GuestNameModal';
import { 
  Room, 
  RoomEvent,
  Track,
  VideoPresets
} from 'livekit-client';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Users,
  Copy,
  Share2,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoRoom() {
  const router = useRouter();
  const { roomId, token } = router.query;
  const { currentUser } = useAuth() || {};
  
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [localIdentity, setLocalIdentity] = useState('');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const controlsTimeoutRef = useRef(null);
  const connectionAttempted = useRef(false);

  // Check if user needs to enter name (for guests)
  useEffect(() => {
    if (!roomId || connectionAttempted.current) return;

    if (!currentUser && !token) {
      setShowGuestModal(true);
      return;
    }

    connectionAttempted.current = true;

    if (currentUser && !token) {
      const identity = getUserIdentity(currentUser);
      fetchTokenAndConnect(identity);
    } else if (token) {
      const identity = currentUser 
        ? getUserIdentity(currentUser)
        : sessionStorage.getItem('guestName') || 'Guest';
      setLocalIdentity(identity);
      connectToRoom(token);
    }
  }, [roomId, token, currentUser]);

  const getUserIdentity = (user) => {
    return user.displayName || user.email?.split('@')[0] || `User-${user.uid.substring(0, 8)}`;
  };

  const fetchTokenAndConnect = async (identity) => {
    try {
      setConnectionError(null);
      const response = await fetch(`/api/token?identity=${encodeURIComponent(identity)}&roomName=${roomId}`);
      const data = await response.json();
      
      if (data.token) {
        setLocalIdentity(identity);
        await connectToRoom(data.token);
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setConnectionError(error.message);
      toast.error('Failed to connect to meeting');
    }
  };

  const handleGuestJoin = (tokenReceived, identity) => {
    const cleanIdentity = identity.replace('guest-', '').split('-')[0];
    setLocalIdentity(cleanIdentity);
    setShowGuestModal(false);
    connectionAttempted.current = true;
    connectToRoom(tokenReceived);
  };

  const connectToRoom = async (roomToken) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
          frameRate: 30,
        },
        audioCaptureDefaults: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Set up event listeners
      newRoom
        .on(RoomEvent.ParticipantConnected, onParticipantConnected)
        .on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected)
        .on(RoomEvent.TrackSubscribed, onTrackSubscribed)
        .on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed)
        .on(RoomEvent.LocalTrackPublished, onLocalTrackPublished)
        .on(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished)
        .on(RoomEvent.TrackMuted, onTrackMuted)
        .on(RoomEvent.TrackUnmuted, onTrackUnmuted)
        .on(RoomEvent.Disconnected, onDisconnected);

      // Connect to the room
      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
      await newRoom.connect(wsUrl, roomToken);
      
      setRoom(newRoom);
      setIsConnected(true);
      setIsConnecting(false);
      
      // Initialize participants list with existing participants
      const existingParticipants = Array.from(newRoom.remoteParticipants.values());
      setParticipants(existingParticipants);
      
      // Enable camera and microphone
      try {
        await newRoom.localParticipant.enableCameraAndMicrophone();
      } catch (mediaError) {
        console.warn('Media access error:', mediaError);
        toast.error('Could not access camera or microphone');
      }
      
      toast.success('Connected to meeting!');
    } catch (error) {
      console.error('Failed to connect to room:', error);
      setConnectionError(error.message);
      toast.error('Failed to connect to meeting');
      setIsConnecting(false);
    }
  };

  const onParticipantConnected = useCallback((participant) => {
    console.log('Participant connected:', participant.identity);
    setParticipants(prev => {
      const filtered = prev.filter(p => p.identity !== participant.identity);
      return [...filtered, participant];
    });
    
    const displayName = getParticipantDisplayName(participant.identity);
    toast.success(`${displayName} joined`, { icon: '👋', duration: 3000 });
  }, []);

  const onParticipantDisconnected = useCallback((participant) => {
    console.log('Participant disconnected:', participant.identity);
    setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
    
    const displayName = getParticipantDisplayName(participant.identity);
    toast.error(`${displayName} left`, { icon: '👋', duration: 3000 });
    
    if (remoteVideoRefs.current[participant.identity]) {
      delete remoteVideoRefs.current[participant.identity];
    }
  }, []);

  const onTrackSubscribed = useCallback((track, publication, participant) => {
    console.log('Track subscribed:', track.kind, participant.identity);
    
    if (track.kind === Track.Kind.Video || track.kind === Track.Kind.ScreenShare) {
      // Use a slight delay to ensure the DOM element exists
      setTimeout(() => {
        const videoElement = remoteVideoRefs.current[participant.identity];
        if (videoElement && track.mediaStream) {
          videoElement.srcObject = track.mediaStream;
        }
      }, 100);
    } else if (track.kind === Track.Kind.Audio) {
      // Audio tracks should be attached to play automatically
      const audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      if (track.mediaStream) {
        audioElement.srcObject = track.mediaStream;
      }
      document.body.appendChild(audioElement);
    }
  }, []);

  const onTrackUnsubscribed = useCallback((track, publication, participant) => {
    console.log('Track unsubscribed:', track.kind, participant.identity);
    
    if (track.kind === Track.Kind.Video || track.kind === Track.Kind.ScreenShare) {
      const videoElement = remoteVideoRefs.current[participant.identity];
      if (videoElement) {
        videoElement.srcObject = null;
      }
    }
  }, []);

  const onLocalTrackPublished = useCallback((publication, participant) => {
    console.log('Local track published:', publication.kind);
    
    if (publication.kind === Track.Kind.Video && localVideoRef.current && publication.track) {
      localVideoRef.current.srcObject = publication.track.mediaStream;
    }
  }, []);

  const onLocalTrackUnpublished = useCallback((publication) => {
    console.log('Local track unpublished:', publication.kind);
    
    if (publication.kind === Track.Kind.Video && localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  const onTrackMuted = useCallback((publication, participant) => {
    console.log('Track muted:', publication.kind, participant?.identity || 'local');
    // Force re-render to update UI
    setParticipants(prev => [...prev]);
  }, []);

  const onTrackUnmuted = useCallback((publication, participant) => {
    console.log('Track unmuted:', publication.kind, participant?.identity || 'local');
    // Force re-render to update UI
    setParticipants(prev => [...prev]);
  }, []);

  const onDisconnected = useCallback(() => {
    setIsConnected(false);
    setRoom(null);
    setParticipants([]);
    toast.error('Disconnected from meeting');
    router.push('/');
  }, [router]);

  const getParticipantDisplayName = (identity) => {
    if (identity.startsWith('guest-')) {
      return identity.replace('guest-', '').split('-')[0];
    }
    return identity;
  };

  const getParticipantInitials = (identity) => {
    const name = getParticipantDisplayName(identity);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const toggleMute = async () => {
    if (!room) return;
    
    try {
      await room.localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleVideo = async () => {
    if (!room) return;
    
    try {
      await room.localParticipant.setCameraEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast.error('Failed to toggle camera');
    }
  };

  const toggleScreenShare = async () => {
    if (!room) return;

    try {
      if (isScreenSharing) {
        await room.localParticipant.setScreenShareEnabled(false);
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      } else {
        await room.localParticipant.setScreenShareEnabled(true);
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen share');
    }
  };

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
    }
    router.push('/');
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy room ID');
    }
  };

  const shareRoom = async () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my meeting',
          text: `Join my video meeting: ${roomId}`,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyRoomId();
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Meeting link copied to clipboard!');
    }
  };

  // Auto-hide controls with longer timeout for mobile
  useEffect(() => {
    const resetTimeout = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000); // Increased timeout
    };

    const handleInteraction = () => resetTimeout();
    
    resetTimeout();
    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('click', handleInteraction);
    
    return () => {
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const isParticipantMuted = (participant) => {
    const audioTrack = Array.from(participant.audioTrackPublications.values())[0];
    return !audioTrack || audioTrack.isMuted;
  };

  const isParticipantVideoOff = (participant) => {
    const videoTrack = Array.from(participant.videoTrackPublications.values())[0];
    return !videoTrack || videoTrack.isMuted;
  };

  const hasScreenShare = (participant) => {
    return Array.from(participant.trackPublications.values()).some(
      pub => pub.source === Track.Source.ScreenShare
    );
  };

  // Show guest modal for unauthenticated users
  if (showGuestModal) {
    return <GuestNameModal isOpen={true} onJoin={handleGuestJoin} roomId={roomId} />;
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Connecting to meeting...</p>
          <p className="text-white/60 mt-2">Room: {roomId}</p>
        </motion.div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <p className="text-xl mb-4">Failed to connect to meeting</p>
          <p className="text-white/60 mb-6">{connectionError}</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                connectionAttempted.current = false;
                setConnectionError(null);
                window.location.reload();
              }}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl mb-4">Initializing meeting...</p>
          <button
            onClick={() => {
              connectionAttempted.current = false;
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded transition-colors text-sm"
          >
            Refresh if stuck
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative flex flex-col overflow-hidden">
      {/* Header */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-black/30 backdrop-blur-lg border-b border-white/10 p-4 z-40 flex-shrink-0"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-white">MeetSpace</h1>
                <div className="flex items-center space-x-2">
                  <span className="text-white/70 text-sm">ID:</span>
                  <code className="bg-white/10 px-2 py-1 rounded text-white font-mono text-sm">
                    {roomId}
                  </code>
                  <button
                    onClick={copyRoomId}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="Copy Room ID"
                  >
                    <Copy className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={shareRoom}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    title="Share Meeting"
                  >
                    <Share2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="flex items-center space-x-2 text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">{participants.length + 1}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Grid - Takes remaining space with safe area */}
      <div className="flex-1 p-4 pb-32" style={{ paddingBottom: 'max(8rem, calc(8rem + env(safe-area-inset-bottom)))' }}>
        <div className="h-full max-w-7xl mx-auto">
          {participants.length === 0 ? (
            // Single participant view
            <div className="h-full flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-2xl aspect-square bg-black/30 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              >
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      {currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={localIdentity}
                          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/20"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
                          <span className="text-white text-2xl font-bold">
                            {getParticipantInitials(localIdentity)}
                          </span>
                        </div>
                      )}
                      <p className="text-lg font-medium">{localIdentity}</p>
                      <p className="text-white/60">Camera is off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-6 left-6">
                  <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-white font-medium">{localIdentity}</span>
                    {isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            // Multi-participant grid with better responsive design
            <div className={`grid gap-2 sm:gap-4 h-full ${
              participants.length === 1 ? 'grid-cols-1 sm:grid-cols-2' :
              participants.length <= 4 ? 'grid-cols-2 grid-rows-2' :
              participants.length <= 6 ? 'grid-cols-2 sm:grid-cols-3 grid-rows-2 sm:grid-rows-2' :
              'grid-cols-2 sm:grid-cols-3 grid-rows-3'
            }`}>
              {/* Local Video */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-black/30 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 aspect-square"
              >
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      {currentUser?.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={localIdentity}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-2 border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-white/20">
                          <span className="text-white text-sm sm:text-xl font-bold">
                            {getParticipantInitials(localIdentity)}
                          </span>
                        </div>
                      )}
                      <p className="text-xs sm:text-sm font-medium truncate px-2">{localIdentity}</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                  <div className="bg-black/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex items-center space-x-1">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full"></div>
                    <span className="text-white text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-none">{localIdentity}</span>
                    {isMuted && <MicOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />}
                  </div>
                </div>
                {isScreenSharing && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <div className="bg-blue-500/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                      <Monitor className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      <span className="text-white text-xs">Sharing</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Remote Videos */}
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.identity}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-black/30 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 aspect-square"
                >
                  <video
                    ref={el => {
                      if (el) remoteVideoRefs.current[participant.identity] = el;
                    }}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  {isParticipantVideoOff(participant) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-white/20">
                          <span className="text-white text-sm sm:text-xl font-bold">
                            {getParticipantInitials(participant.identity)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium truncate px-2">
                          {getParticipantDisplayName(participant.identity)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                    <div className="bg-black/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full flex items-center space-x-1">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full"></div>
                      <span className="text-white text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-none">
                        {getParticipantDisplayName(participant.identity)}
                      </span>
                      {isParticipantMuted(participant) && <MicOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />}
                    </div>
                  </div>
                  {hasScreenShare(participant) && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <div className="bg-blue-500/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                        <Monitor className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                        <span className="text-white text-xs">Sharing</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Controls - Always visible at bottom with safe area */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-lg border-t border-white/10 p-4 sm:p-6 pb-8 sm:pb-6 z-50"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-center space-x-3 sm:space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`p-3 sm:p-4 rounded-full transition-all ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-sm`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleVideo}
            className={`p-3 sm:p-4 rounded-full transition-all ${
              isVideoOff 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-sm`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleScreenShare}
            className={`p-3 sm:p-4 rounded-full transition-all ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-white/20 hover:bg-white/30'
            } backdrop-blur-sm`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={leaveRoom}
            className="p-3 sm:p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors backdrop-blur-sm"
            title="Leave meeting"
          >
            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.button>
        </div>

        {/* Show controls indicator on mobile */}
        <AnimatePresence>
          {!showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 sm:hidden"
            >
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <p className="text-white text-xs">Tap to show controls</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}