// Fix line 176 - Use promise-based approach instead of callback
app.get('/api/clients', async (req, res) => {
  try {
    const channel = ably.channels.get('translation-session');
    // Change from callback to promise-based
    const members = await channel.presence.get();
    res.json({ count: members.length, clients: members });
  } catch (error) {
    logger.error('Failed to get client count', 'api', error);
    res.status(500).json({ error: 'Failed to get client count' });
  }
});

// Fix lines 214-222 - Use correct publish method signature
app.post('/api/session/:sessionId/broadcast', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, data } = req.body;
    
    const channel = ably.channels.get(`session-${sessionId}`);
    // Use promise-based publish with correct signature (name, data)
    await channel.publish('server:broadcast', {
      message,
      data,
      timestamp: Date.now(),
      sessionId
    });
    
    res.json({ success: true });
  } catch (error) {
    logger.error('Failed to broadcast message', 'api', error);
    res.status(500).json({ error: 'Failed to broadcast message' });
  }
});