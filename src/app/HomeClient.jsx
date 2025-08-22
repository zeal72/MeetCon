"use client";

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import QuickActions from '@/components/QuickActions';
import JoinMeetingModal from '@/components/JoinMeetingModal';
import AuthModal from '@/components/AuthModal';
import UserProfile from '@/components/userProfile';
import { Video, LogIn, UserPlus } from 'lucide-react';

export default function HomeClient() {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [meetingId, setMeetingId] = useState('');

  const { currentUser } = useAuth();

  const handleJoinMeeting = () => {
    if (!currentUser) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setIsJoinModalOpen(true);
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Video className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">MeetSpace</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <UserProfile />
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-200"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Connect. Collaborate. Create.
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Experience seamless video conferencing with crystal-clear quality and intuitive controls.
          </p>
        </div>

        {currentUser ? (
          <QuickActions onJoinMeeting={handleJoinMeeting} />
        ) : (
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Get Started</h3>
              <p className="text-white/70 mb-6">
                Sign in or create an account to start your first meeting
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-lg transition-all duration-200"
                >
                  Create Account
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <JoinMeetingModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        meetingId={meetingId}
        setMeetingId={setMeetingId}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </div>
  );
}