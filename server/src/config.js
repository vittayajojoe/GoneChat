export const config = {
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultTTL: 1800, // 30 minutes in seconds
  maxRoomTTL: 86400, // 24 hours in seconds
  minRoomTTL: 60, // 1 minute in seconds
  allowedTTLs: [
    { label: '5 minutes', value: 300 },
    { label: '15 minutes', value: 900 },
    { label: '30 minutes', value: 1800 },
    { label: '1 hour', value: 3600 },
    { label: '6 hours', value: 21600 },
    { label: '24 hours', value: 86400 }
  ],
  maxParticipants: 2,
  maxMessageLength: 2000,
  maxNicknameLength: 30,
  rateLimit: {
    windowMs: 1000, // 1 second
    maxMessages: 5  // max 5 messages per second per client
  },
  autoDestroyEmptyAfterMs: 60000 // 1 minute after last participant disconnects
};
