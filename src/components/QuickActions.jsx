"use client";

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Video,
  Calendar,
  Plus,
  Link,
  Phone,
  Sparkles,
  Zap,
  Shield,
  User,
  CheckCircle
} from 'lucide-react';

export default function QuickActions({ onJoinMeeting }) {
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleStartMeeting = async () => {
    const newMeetingId = Math.random().toString(36).substr(2, 9);
    
    // Generate proper identity and user info
    let identity, name, avatar, isAuthenticated, userId;
    
    if (currentUser) {
      // Authenticated Google user
      identity = `user-${currentUser.uid}`;
      name = currentUser.displayName || 'User';
      avatar = currentUser.photoURL || '';
      isAuthenticated = true;
      userId = currentUser.uid;
      
      console.log('Starting meeting for authenticated user:', {
        identity, name, avatar, userId
      });
    } else {
      // Unauthenticated user - will be handled by guest modal in room
      identity = `temp-host-${Date.now()}`;
      name = '';
      avatar = '';
      isAuthenticated = false;
      userId = null;
      
      console.log('Starting meeting for unauthenticated user - will show guest modal');
    }
    
    try {
      const loadingToast = toast.loading('Creating meeting...');
      
      // Build URL parameters properly
      const params = new URLSearchParams({
        identity: identity,
        roomName: newMeetingId,
        isAuthenticated: isAuthenticated.toString()
      });
      
      if (name) params.append('name', name);
      if (avatar) params.append('avatar', avatar);
      if (userId) params.append('userId', userId);
      
      const url = `/api/token?${params.toString()}`;
      console.log('Creating meeting with URL:', url);
      
      const response = await fetch(url);
      toast.dismiss(loadingToast);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } else {
            const errorText = await response.text();
            if (errorText.includes('<!DOCTYPE html>')) {
              errorMessage = "API route not found. Please check if /pages/api/token.js exists.";
            } else {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        toast.error(errorMessage);
        return;
      }

      const data = await response.json();
      console.log('Token response:', data);
      
      if (!data.token) {
        toast.error("No token received from server");
        console.error('No token in response:', data);
        return;
      }

      toast.success(`Meeting created! ID: ${newMeetingId}`);
      
      // Store comprehensive meeting data
      const meetingData = {
        token: data.token,
        identity: data.identity,
        roomName: data.roomName,
        livekitUrl: data.LIVEKIT_URL,
        displayName: data.displayName,
        avatar: data.avatar,
        userType: data.userType,
        metadata: data.metadata,
        isAuthenticated: isAuthenticated,
        userId: userId,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('meetingData', JSON.stringify(meetingData));
      
      // Navigate to room
      router.push(`/room/${newMeetingId}`);
      
    } catch (error) {
      console.error("Failed to start meeting:", error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error("Cannot connect to server. Please check if your server is running.");
      } else {
        toast.error(`Failed to start meeting: ${error.message}`);
      }
    }
  };

  const handleJoinMeeting = () => {
    // This will trigger the join meeting modal/functionality
    if (onJoinMeeting) {
      onJoinMeeting();
    }
  };

  const handleScheduleMeeting = () => {
    toast.success('Opening scheduler...');
    console.log('Schedule meeting functionality not yet implemented');
  };

  const actions = [
    {
      title: 'Start Meeting',
      description: currentUser 
        ? `Start a meeting as ${currentUser.displayName || 'User'}` 
        : 'Create an instant meeting and invite others',
      icon: Video,
      accent: Sparkles,
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'from-green-600 to-emerald-700',
      accentColor: 'text-green-400',
      action: handleStartMeeting,
      buttonText: 'Start Now',
      buttonIcon: Plus
    },
    {
      title: 'Join Meeting',
      description: 'Join an existing meeting with an ID or link',
      icon: Link,
      accent: Zap,
      gradient: 'from-blue-500 to-cyan-600',
      hoverGradient: 'from-blue-600 to-cyan-700',
      accentColor: 'text-blue-400',
      action: handleJoinMeeting,
      buttonText: 'Join',
      buttonIcon: Phone
    },
    {
      title: 'Schedule Meeting',
      description: 'Plan and schedule meetings for later',
      icon: Calendar,
      accent: Shield,
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'from-purple-600 to-pink-700',
      accentColor: 'text-purple-400',
      action: handleScheduleMeeting,
      buttonText: 'Schedule',
      buttonIcon: Calendar
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Enhanced user info display if authenticated */}
      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full mb-4 bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=4285F4&color=fff&size=40&bold=true`}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=4285F4&color=fff&size=40&bold=true`;
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-2 h-2 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white font-medium flex items-center space-x-2">
                  <span>Welcome, {currentUser.displayName || 'User'}</span>
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">Google User</span>
                </p>
                <p className="text-white/60 text-sm">Ready to start or join a meeting</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs">Authenticated</p>
              <User className="w-5 h-5 text-blue-400 ml-auto mt-1" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Unauthenticated user info */}
      {!currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-full mb-4 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Guest Mode</p>
              <p className="text-white/60 text-sm">You'll be asked for your name when joining meetings</p>
            </div>
          </div>
        </motion.div>
      )}

      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`bg-gradient-to-r ${action.gradient} p-3 rounded-xl shadow-lg`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <action.accent className={`w-5 h-5 ${action.accentColor} opacity-60`} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{action.title}</h3>
          <p className="text-white/60 mb-4 text-sm leading-relaxed">{action.description}</p>
          <button
            onClick={action.action}
            className={`w-full bg-gradient-to-r ${action.gradient} hover:${action.hoverGradient} text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20`}
          >
            <action.buttonIcon className="w-5 h-5" />
            <span>{action.buttonText}</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}