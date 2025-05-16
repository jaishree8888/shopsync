const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  console.log('Auth header received:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ msg: 'No authorization header provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    console.log('No Bearer token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};