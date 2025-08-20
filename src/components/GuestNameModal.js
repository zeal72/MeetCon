// components/GuestNameModal.js
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuestNameModal({ isOpen, onJoin, roomId }) {
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (guestName.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Store guest name in sessionStorage for the duration of the session
      sessionStorage.setItem('guestName', guestName.trim());
      
      // Generate token for guest
      const identity = `guest-${guestName.trim()}-${Date.now()}`;
      const response = await fetch(`/api/token?identity=${encodeURIComponent(identity)}&roomName=${roomId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get access token');
      }

      const data = await response.json();
      
      if (data.token) {
        onJoin(data.token, identity);
        toast.success(`Welcome ${guestName}!`);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Failed to join as guest:', error);
      toast.error('Failed to join meeting. Please try again.');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleJoin();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Meeting</h2>
              <p className="text-white/70">Enter your name to continue</p>
              <div className="mt-3 px-3 py-1 bg-white/10 rounded-full inline-block">
                <span className="text-white/60 text-sm">Room: </span>
                <span className="text-white font-mono text-sm">{roomId}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/50 transition-all"
                  autoFocus
                  disabled={isLoading}
                  maxLength={50}
                />
              </div>

              <button
                onClick={handleJoin}
                disabled={isLoading || !guestName.trim()}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Joining...</span>
                  </>
                ) : (
                  <>
                    <span>Join Meeting</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-white/60 text-xs text-center">
                By joining, you agree to our meeting guidelines
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}