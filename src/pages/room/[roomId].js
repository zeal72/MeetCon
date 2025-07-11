// pages/room/[roomId].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { LiveKitRoom, VideoConference, formatChatMessageLinks } from '@livekit/components-react';
import '@livekit/components-styles';

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;
  const [token, setToken] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [identity, setIdentity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) return;

    // Try to get meeting data from localStorage first
    const meetingData = localStorage.getItem('meetingData');
    if (meetingData) {
      try {
        const data = JSON.parse(meetingData);
        if (data.roomName === roomId) {
          setToken(data.token);
          setWsUrl(data.livekitUrl);
          setIdentity(data.identity);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing meeting data:', e);
      }
    }

    // If no meeting data in localStorage, generate new token
    generateToken();
  }, [roomId]);

  const generateToken = async () => {
    try {
      const identity = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      const response = await fetch(`/api/token?identity=${identity}&roomName=${roomId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get token');
      }

      const data = await response.json();
      
      setToken(data.token);
      setWsUrl(data.LIVEKIT_URL);
      setIdentity(data.identity);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating token:', error);
      setError('Failed to join room. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    // Clean up localStorage and redirect to home
    localStorage.removeItem('meetingData');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-red-400 text-xl font-semibold mb-2">Error</h2>
            <p className="text-white mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !wsUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Unable to connect to room</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={wsUrl}
        data-lk-theme="default"
        style={{ height: '100vh' }}
        onDisconnected={handleDisconnect}
      >
        <VideoConference 
          chatMessageFormatter={formatChatMessageLinks}
        />
      </LiveKitRoom>
    </div>
  );
}
