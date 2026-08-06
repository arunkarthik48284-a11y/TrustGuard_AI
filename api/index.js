let appModule = null;
let loadError = null;

try {
  appModule = require('../backend/src/app');
} catch (err) {
  loadError = err;
  console.error('Failed to load backend app module:', err);
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Lazy attempt if initial load failed
  if (!appModule) {
    try {
      appModule = require('../backend/src/app');
      loadError = null;
    } catch (retryErr) {
      loadError = retryErr;
    }
  }

  if (!appModule) {
    return res.status(500).json({
      error: 'Backend Initialization Exception',
      message: loadError ? loadError.message : 'TrustGuard backend engine loading failed.',
      stack: process.env.NODE_ENV === 'development' ? (loadError ? loadError.stack : null) : undefined
    });
  }

  try {
    return appModule(req, res);
  } catch (err) {
    console.error('Serverless Execution Exception:', err);
    return res.status(500).json({
      error: 'Serverless Runtime Exception',
      message: err.message
    });
  }
};
