"use client";

import { useRouter } from 'next/navigation';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import GuestNameModal from '@/components/GuestNameModal';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile as DefaultParticipantTile,
  useTracks,
  LayoutContextProvider,
  RoomAudioRenderer,
  ControlBar,
  Chat,
  useParticipantContext,
  VideoTrack,
  AudioTrack,
} from '@livekit/components-react';
import { Track as LiveKitTrack } from 'livekit-client';
import '@livekit/components-styles';
import './custom-livekit-styles.css';

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // FIXED: Get roomId from params.roomid (lowercase to match your file structure [roomid])
  const roomId = params?.roomid || params?.roomId || searchParams?.get('roomId') || searchParams?.get('id');
  
  console.log('All params:', params);
  console.log('Extracted roomId:', roomId);
  console.log('URL pathname:', typeof window !== 'undefined' ? window.location.pathname : 'N/A');
  
  const { currentUser } = useAuth() || {};
  const [token, setToken] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [identity, setIdentity] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    console.log('=== Room Page Debug Info ===');
    console.log('params:', params);
    console.log('roomId extracted:', roomId);
    console.log('currentUser:', currentUser);
    console.log('URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
    
    if (!roomId) {
      console.error('❌ No room ID found in URL');
      console.log('Available params keys:', Object.keys(params || {}));
      
      // Try to extract from URL manually as fallback
      if (typeof window !== 'undefined') {
        const urlParts = window.location.pathname.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        if (lastPart && lastPart !== 'room' && lastPart.length > 5) {
          console.log('🔧 Found roomId in URL path:', lastPart);
          // Update the component with the found roomId
          window.history.replaceState(null, '', window.location.href);
          setError('');
          handleRoomJoin(lastPart);
          return;
        }
      }
      
      setError('No room ID provided. Please start a meeting first.');
      setIsLoading(false);
      return;
    }

    console.log('✅ Room ID found:', roomId);
    handleRoomJoin(roomId);
  }, [roomId, currentUser]);

  const handleRoomJoin = (roomIdToUse) => {
    // Check for existing meeting data in localStorage
    const meetingData = localStorage.getItem('meetingData');
    if (meetingData) {
      try {
        const data = JSON.parse(meetingData);
        console.log('Found meeting data:', data);
        
        if (data.roomName === roomIdToUse && data.token) {
          // Verify the token is still valid (basic check)
          const tokenPayload = parseJWT(data.token);
          const now = Math.floor(Date.now() / 1000);
          
          if (tokenPayload && tokenPayload.exp > now) {
            console.log('✅ Using existing valid token');
            setToken(data.token);
            setWsUrl(data.livekitUrl);
            setIdentity(data.identity);
            setDisplayName(data.displayName || data.metadata?.name || '');
            setUserAvatar(data.avatar || data.metadata?.avatar || '');
            setIsLoading(false);
            return;
          } else {
            console.log('❌ Token expired, removing old data');
            localStorage.removeItem('meetingData');
          }
        }
      } catch (e) {
        console.error('Error parsing meeting data:', e);
        localStorage.removeItem('meetingData');
      }
    }

    // Determine authentication flow
    if (currentUser) {
      console.log('🔐 User is authenticated, generating token');
      generateTokenForUser(currentUser, roomIdToUse);
    } else {
      console.log('👤 User not authenticated, showing guest modal');
      setShowGuestModal(true);
      setIsLoading(false);
    }
  };

  // Helper function to parse JWT (basic parsing, no verification)
  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  const generateTokenForUser = async (user, roomIdToUse) => {
    try {
      setIsLoading(true);
      
      const identity = `user-${user.uid}`;
      const name = user.displayName || 'User';
      const avatar = user.photoURL || '';
      
      console.log('🔄 Generating token for authenticated user:', { identity, name, avatar, roomId: roomIdToUse });
      
      const params = new URLSearchParams({
        identity: identity,
        roomName: roomIdToUse,
        name: name,
        isAuthenticated: 'true',
        userId: user.uid
      });
      
      if (avatar) {
        params.append('avatar', avatar);
      }
      
      const url = `/api/token?${params.toString()}`;
      console.log('📡 API URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Token generation failed:', errorText);
        throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Token response for authenticated user:', data);
      
      if (!data.token || !data.LIVEKIT_URL) {
        throw new Error('Invalid token response: missing token or LIVEKIT_URL');
      }

      // Store meeting data
      const meetingData = {
        token: data.token,
        identity: data.identity,
        roomName: roomIdToUse,
        livekitUrl: data.LIVEKIT_URL,
        displayName: data.displayName,
        avatar: data.avatar,
        userType: data.userType,
        metadata: data.metadata,
        isAuthenticated: true,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('meetingData', JSON.stringify(meetingData));

      setToken(data.token);
      setWsUrl(data.LIVEKIT_URL);
      setIdentity(data.identity);
      setDisplayName(data.displayName);
      setUserAvatar(data.avatar);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Error generating token for user:', error);
      setError(`Failed to join room: ${error.message}`);
      setIsLoading(false);
    }
  };

  const generateTokenForGuest = async (guestName) => {
    try {
      setIsLoading(true);
      
      const identity = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      console.log('🔄 Generating token for guest:', { identity, guestName, roomId });
      
      const params = new URLSearchParams({
        identity: identity,
        roomName: roomId,
        name: guestName,
        isAuthenticated: 'false'
      });
      
      const url = `/api/token?${params.toString()}`;
      console.log('📡 Guest API URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Guest token generation failed:', errorText);
        throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Token response for guest:', data);
      
      if (!data.token || !data.LIVEKIT_URL) {
        throw new Error('Invalid token response: missing token or LIVEKIT_URL');
      }

      // Store meeting data for guest
      const meetingData = {
        token: data.token,
        identity: data.identity,
        roomName: roomId,
        livekitUrl: data.LIVEKIT_URL,
        displayName: data.displayName,
        avatar: data.avatar,
        userType: data.userType,
        metadata: data.metadata,
        isGuest: true,
        guestName: guestName,
        isAuthenticated: false,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('meetingData', JSON.stringify(meetingData));

      setToken(data.token);
      setWsUrl(data.LIVEKIT_URL);
      setIdentity(data.identity);
      setDisplayName(data.displayName);
      setUserAvatar(data.avatar);
      setIsLoading(false);

    } catch (error) {
      console.error('❌ Error generating token for guest:', error);
      setError(`Failed to join room: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = (name) => {
    if (!name || !name.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const trimmedName = name.trim();
    if (trimmedName.length < 1) {
      alert('Name must be at least 1 character long');
      return;
    }
    
    setShowGuestModal(false);
    generateTokenForGuest(trimmedName);
  };

  const handleGuestCancel = () => {
    console.log('Guest cancelled, redirecting home');
    localStorage.removeItem('meetingData');
    router.push('/');
  };

  const handleDisconnect = () => {
    console.log('Disconnecting from room');
    localStorage.removeItem('meetingData');
    router.push('/');
  };

  const handleRoomError = (error) => {
    console.error('LiveKit room error:', error);
    setError(`Room connection error: ${error.message}`);
  };

  const handleTryAgain = () => {
    setError('');
    setIsLoading(true);
    
    // Try to reload the page or re-extract roomId
    if (typeof window !== 'undefined') {
      const urlParts = window.location.pathname.split('/');
      const urlRoomId = urlParts[urlParts.length - 1];
      
      if (urlRoomId && urlRoomId !== 'room' && urlRoomId.length > 5) {
        console.log('🔄 Retrying with roomId:', urlRoomId);
        handleRoomJoin(urlRoomId);
      } else {
        setError('Unable to find room ID in URL. Please start a new meeting.');
        setIsLoading(false);
      }
    }
  };

  // Show guest modal
  if (showGuestModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <GuestNameModal
          isOpen={showGuestModal}
          onSubmit={handleGuestSubmit}
          onClose={handleGuestCancel}
          roomId={roomId}
        />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
          <h2 className="text-white text-xl font-semibold mb-2">
            {currentUser ? 'Joining Meeting...' : 'Setting up your session...'}
          </h2>
          <p className="text-white/70 text-sm">
            {currentUser ? 
              `Welcome ${currentUser.displayName || 'User'}! Connecting you to room: ${roomId}` :
              `Preparing to join room: ${roomId}`
            }
          </p>
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-8">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-red-400 text-xl font-semibold mb-3">Connection Error</h2>
            <p className="text-white mb-6 text-sm leading-relaxed">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleTryAgain}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
            <div className="mt-4 text-xs text-white/40">
              Current URL: {typeof window !== 'undefined' ? window.location.pathname : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unable to connect state
  if (!token || !wsUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-8">
            <h2 className="text-yellow-400 text-xl font-semibold mb-3">Unable to Connect</h2>
            <p className="text-white mb-6 text-sm">
              We couldn't establish a connection to the meeting room. This might be due to network issues or server problems.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Refresh Page
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={wsUrl}
        data-lk-theme="default"
        style={{ height: '100vh' }}
        onDisconnected={handleDisconnect}
        onError={handleRoomError}
        connectOptions={{
          autoSubscribe: true,
          publishDefaults: {
            videoCodec: 'vp8',
            dtx: true,
            red: true,
          },
        }}
      >
        <LayoutContextProvider>
          <div className="custom-room-container h-full flex flex-col">
            <div className="flex-1 flex">
              <div className="flex-1">
                <CustomGridLayout />
              </div>
              <Chat className="w-80 border-l border-white/10" />
            </div>
            <ControlBar className="custom-control-bar bg-black/50 backdrop-blur-sm" />
          </div>
        </LayoutContextProvider>
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

// Custom Grid Layout for better UI
function CustomGridLayout() {
  const tracks = useTracks(
    [
      { source: LiveKitTrack.Source.Camera, withPlaceholder: true },
      { source: LiveKitTrack.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout 
      tracks={tracks} 
      className="custom-grid-layout h-full p-4"
    >
      {/* Use the default ParticipantTile with custom styling */}
      <DefaultParticipantTile />
    </GridLayout>
  );
}

// Remove the CustomParticipantTile component for now - we'll add CSS styling instead