// pages/api/token.js - Debug version
import { AccessToken } from 'livekit-server-sdk';

export default async function handler(req, res) {
  const { identity, roomName } = req.query;

  console.log('Environment variables check:');
  console.log('LIVEKIT_API_KEY:', process.env.LIVEKIT_API_KEY ? 'Set' : 'Missing');
  console.log('LIVEKIT_API_SECRET:', process.env.LIVEKIT_API_SECRET ? 'Set' : 'Missing');
  console.log('LIVEKIT_URL:', process.env.LIVEKIT_URL ? 'Set' : 'Missing');

  if (!identity || !roomName) {
    return res.status(400).json({ error: 'Missing identity or roomName' });
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
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: '1h', // Token expires in 1 hour
    });

    // Grant permissions for the room
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();
    
    res.status(200).json({ 
      token: jwt,
      LIVEKIT_URL,
      identity,
      roomName,
      success: true
    });
  } catch (error) {
    console.error('Error generating token:', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message
    });
  }
}