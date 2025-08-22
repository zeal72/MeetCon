import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  const { identity, roomName, name, avatar, isAuthenticated, userId } = req.query;
  
  console.log('Token request received:', {
    identity,
    roomName,
    name,
    avatar: avatar ? 'Provided' : 'Not provided',
    isAuthenticated,
    userId
  });

  // Validate required parameters
  if (!identity || !roomName) {
    return res.status(400).json({ 
      error: 'Missing required parameters', 
      details: 'Both identity and roomName are required' 
    });
  }

  // Check environment variables
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const LIVEKIT_URL = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !LIVEKIT_URL) {
    console.error('Missing environment variables:', {
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
      LIVEKIT_URL: !!LIVEKIT_URL
    });
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Missing environment variables. Check your .env.local file.'
    });
  }

  try {
    // Create access token with proper identity
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: '2h', // Extended for longer meetings
    });

    // Determine user display information
    let displayName;
    let userAvatar;
    let userType;

    if (isAuthenticated === 'true' && name) {
      // Authenticated Google user
      displayName = name;
      userAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=128&bold=true`;
      userType = 'authenticated';
    } else if (name && name.trim()) {
      // Guest user with provided name
      displayName = name.trim();
      userAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128&bold=true`;
      userType = 'guest';
    } else {
      // Fallback (should rarely happen with proper frontend handling)
      displayName = identity.includes('user-') ? 'User' : identity.includes('guest-') ? 'Guest' : 'Participant';
      userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6B7280&color=fff&size=128`;
      userType = 'anonymous';
    }

    // Create comprehensive metadata
    const metadata = JSON.stringify({
      name: displayName,
      avatar: userAvatar,
      userType: userType,
      isAuthenticated: isAuthenticated === 'true',
      userId: userId || null,
      joinedAt: new Date().toISOString(),
      // Add any additional metadata you might need
      version: '1.0' // For future metadata migrations
    });

    // Add grants to the token
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      metadata: metadata,
    });

    // Generate JWT
    const jwt = await token.toJwt();
    
    console.log('Token generated successfully for:', {
      identity,
      displayName,
      userType,
      room: roomName
    });

    // Return successful response
    res.status(200).json({
      token: jwt,
      LIVEKIT_URL,
      identity,
      roomName,
      displayName,
      avatar: userAvatar,
      userType,
      success: true,
      metadata: {
        name: displayName,
        avatar: userAvatar,
        userType: userType
      }
    });

  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({
      error: 'Failed to generate token',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}