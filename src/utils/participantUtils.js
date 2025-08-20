// utils/participantUtils.js - Utilities for managing participant display

/**
 * Get a clean display name from participant identity
 * Handles both authenticated users and guests
 */
export const getParticipantDisplayName = (identity) => {
  if (!identity) return 'Unknown';
  
  // Handle guest identities (guest-name-timestamp)
  if (identity.startsWith('guest-')) {
    const parts = identity.split('-');
    return parts[1] || 'Guest';
  }
  
  // Handle cleaned identities (names with underscores)
  return identity.replace(/_/g, ' ');
};

/**
 * Get initials for participant avatar
 */
export const getParticipantInitials = (identity) => {
  const name = getParticipantDisplayName(identity);
  const words = name.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

/**
 * Get avatar component for participant
 */
export const getParticipantAvatar = (identity, photoURL = null, size = 'md') => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };
  
  const className = `${sizeClasses[size]} rounded-full flex items-center justify-center`;
  
  if (photoURL) {
    return {
      type: 'image',
      src: photoURL,
      alt: getParticipantDisplayName(identity),
      className: `${className} object-cover`
    };
  }
  
  // Determine gradient based on identity for consistent colors
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-blue-600',
    'from-orange-500 to-red-600',
    'from-teal-500 to-cyan-600',
    'from-indigo-500 to-purple-600'
  ];
  
  const hash = identity.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradientIndex = hash % gradients.length;
  
  return {
    type: 'initials',
    initials: getParticipantInitials(identity),
    className: `${className} bg-gradient-to-r ${gradients[gradientIndex]} text-white font-bold`
  };
};

/**
 * Check if participant is a guest
 */
export const isGuestParticipant = (identity) => {
  return identity && identity.startsWith('guest-');
};

/**
 * Format participant identity for API calls
 */
export const formatIdentityForAPI = (displayName, email, uid) => {
  if (displayName) {
    // Clean display name for API compatibility
    return displayName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  }
  
  if (email) {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
  }
  
  if (uid) {
    return `user_${uid.substring(0, 8)}`;
  }
  
  return `anonymous_${Date.now()}`;
};

/**
 * Get participant status indicators
 */
export const getParticipantStatus = (participant) => {
  if (!participant) return { audio: false, video: false };
  
  const audioTrack = Array.from(participant.audioTrackPublications.values())[0];
  const videoTrack = Array.from(participant.videoTrackPublications.values())[0];
  
  return {
    audio: audioTrack && !audioTrack.isMuted,
    video: videoTrack && !videoTrack.isMuted,
    screen: participant.isScreenShareEnabled || false,
    speaking: participant.isSpeaking || false
  };
};

/**
 * Get connection quality indicator
 */
export const getConnectionQuality = (participant) => {
  if (!participant.connectionQuality) return 'unknown';
  
  const quality = participant.connectionQuality;
  
  return {
    excellent: { color: 'bg-green-400', label: 'Excellent' },
    good: { color: 'bg-yellow-400', label: 'Good' },
    poor: { color: 'bg-red-400', label: 'Poor' },
    unknown: { color: 'bg-gray-400', label: 'Unknown' }
  }[quality] || { color: 'bg-gray-400', label: 'Unknown' };
};