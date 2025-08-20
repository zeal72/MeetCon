

// components/UserProfile.js

import { useState } from 'react';
import { useAuth } from '@/Contexts/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
      >
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt={currentUser.displayName || 'User'} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="text-white hidden sm:block">
          {currentUser.displayName || currentUser.email}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 py-2 z-50">
          <div className="px-4 py-2 border-b border-white/20">
            <p className="text-white font-medium">
              {currentUser.displayName || 'User'}
            </p>
            <p className="text-white/60 text-sm">{currentUser.email}</p>
          </div>
          
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              // Add settings functionality here
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              logout();
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}