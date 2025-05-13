const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Extract token from Authorization header
  const authHeader = req.header('Authorization');
  console.log('Auth header received:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Bearer token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token extracted:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    if (!decoded.user || !decoded.user.id) {
      console.log('Decoded token missing user.id');
      return res.status(401).json({ msg: 'Invalid token payload' });
    }
    
    req.user = decoded.user; // Set req.user to { id }
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};