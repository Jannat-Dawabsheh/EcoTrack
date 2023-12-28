
const jwt = require('jsonwebtoken');

module.exports=(req, res, next)=> {    
        const token = req.headers['token'];
      
        if (!token) {
          return res.status(403).json({ error: 'Token not provided' });
        }
      
        jwt.verify(token, 'your-secret-key', (err, decoded) => {
          if (err) {
            return res.status(401).json({ error: 'Invalid token' });
          }
          req.userId = decoded.userId;
          req.name = decoded.name;
          req.email = decoded.email;
          next();
        });
      
};