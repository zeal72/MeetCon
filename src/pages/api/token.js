// pages/api/token.js - Updated with better identity handling
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  const { identity, roomName } = req.query;
  
  console.log('Token request:', { identity, roomName });
  console.log('Environment variables check:');
  console.log('LIVEKIT_API_KEY:', process.env.LIVEKIT_API_KEY ? 'Set' : 'Missing');
  console.log('LIVEKIT_API_SECRET:', process.env.LIVEKIT_API_SECRET ? 'Set' : 'Missing');
  console.log('LIVEKIT_URL:', process.env.LIVEKIT_URL ? 'Set' : 'Missing');

  if (!identity || !roomName) {
    return res.status(400).json({ 
      error: 'Missing identity or roomName',
      details: 'Both identity and roomName are required parameters'
    });
  }

  // Validate identity length and characters
  if (identity.length > 100) {
    return res.status(400).json({
      error: 'Identity too long',
      details: 'Identity must be less than 100 characters'
    });
  }

  // These should be in your environment variables
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
    // Clean up identity for LiveKit compatibility
    const cleanIdentity = identity
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace invalid characters with underscore
      .substring(0, 50); // Limit length

    console.log('Creating token for identity:', cleanIdentity);

    const token = new AccessToken(apiKey, apiSecret, {
      identity: cleanIdentity,
      ttl: '2h', // Token expires in 2 hours
    });

    // Grant comprehensive permissions for the room
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });

    const jwt = await token.toJwt();
   
    console.log('Token generated successfully for:', cleanIdentity);

    res.status(200).json({
      token: jwt,
      LIVEKIT_URL,
      identity: cleanIdentity,
      originalIdentity: identity,
      roomName,
      success: true,
      expiresIn: '2h'
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