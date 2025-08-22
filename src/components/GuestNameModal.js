"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Video, X, ArrowRight, Shield, Globe } from 'lucide-react';

export default function GuestNameModal({ isOpen, onSubmit, onClose, roomId }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    // Validation
    if (!trimmedName) {
      setError('Please enter your name');
      inputRef.current?.focus();
      return;
    }
    
    if (trimmedName.length < 1) {
      setError('Name must be at least 1 character long');
      inputRef.current?.focus();
      return;
    }
    
    if (trimmedName.length > 50) {
      setError('Name must be less than 50 characters');
      inputRef.current?.focus();
      return;
    }

    // Check for inappropriate content (basic check)
    const inappropriateWords = ['admin', 'moderator', 'host', 'null', 'undefined'];
    if (inappropriateWords.some(word => trimmedName.toLowerCase().includes(word))) {
      setError('Please choose a different name');
      inputRef.current?.focus();
      return;
    }

    setError('');
    setIsLoading(true);
    
    try {
      await onSubmit(trimmedName);
    } catch (error) {
      setError('Failed to join meeting. Please try again.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join Meeting</h2>
              <p className="text-white/60 text-sm">
                Enter your name to join the meeting
                {roomId && (
                  <span className="block mt-1 font-mono text-xs bg-white/10 rounded-lg px-2 py-1 inline-block">
                    Room: {roomId}
                  </span>
                )}
              </p>
            </div>

            {/* Guest info banner */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-blue-200 font-medium text-sm mb-1">Joining as Guest</h4>
                  <p className="text-blue-200/70 text-xs leading-relaxed">
                    You're joining this meeting as a guest. Your name will be visible to other participants.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-white/80 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    ref={inputRef}
                    id="guestName"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    maxLength={50}
                    autoComplete="name"
                  />
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-400 text-sm flex items-center space-x-1"
                  >
                    <span className="w-4 h-4 flex items-center justify-center bg-red-500 rounded-full text-xs">!</span>
                    <span>{error}</span>
                  </motion.p>
                )}
                <p className="mt-2 text-white/40 text-xs">
                  This name will be shown to other meeting participants
                </p>
              </div>

              {/* Privacy notice */}
              <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300 text-xs leading-relaxed">
                    <strong>Privacy:</strong> We don't store personal information from guest users. Your name is only used during this meeting session.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Meeting</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Close button */}
            {!isLoading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}