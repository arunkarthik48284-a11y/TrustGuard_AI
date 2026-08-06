let app;
try {
  app = require('../backend/src/app');
} catch (err) {
  console.error('Failed to load backend app module:', err.message);
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!app) {
    return res.status(500).json({
      error: 'Backend Initialization Exception',
      message: 'TrustGuard backend engine loading failed.'
    });
  }

  try {
    return app(req, res);
  } catch (err) {
    console.error('Serverless Execution Exception:', err);
    return res.status(500).json({
      error: 'Serverless Runtime Exception',
      message: err.message
    });
  }
};
