// ========================================================
// KOJI SUSHI - VERCEL SERVERLESS FUNCTION HANDLER
// ========================================================
const { handler: netlifyHandler } = require('../netlify/functions/api.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }

  const event = {
    httpMethod: req.method,
    queryStringParameters: req.query || {},
    body: req.body ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : null,
    headers: req.headers
  };

  try {
    const result = await netlifyHandler(event, {});
    
    if (result.headers) {
      Object.entries(result.headers).forEach(([k, v]) => {
        res.setHeader(k, v);
      });
    }

    const statusCode = result.statusCode || 200;
    const data = result.body ? JSON.parse(result.body) : {};
    return res.status(statusCode).json(data);
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
