
const jwt = require('jsonwebtoken');
const util = require("util");
const con=require('../config/config');

// Function to get user by name from the database
function getUserByName(name) {
  return new Promise((resolve, reject) => {
    con.query("SELECT * FROM user WHERE name = ?", [name], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]); // we expect at most one user with the given name
      }
    });
  });
}

const authenticateToken = (req, res, next) => {

  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
      
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
        });
};

// function to delete a user by name from the database
const deleteUserByName = async (userName) => {
  const queryAsync = util.promisify(con.query).bind(con);

  const deleteResult = await queryAsync("DELETE FROM user WHERE name = ?", [
    userName,
  ]);

  return deleteResult.affectedRows > 0; // Check if any rows were affected
};

  

module.exports = {
  deleteUserByName,
  getUserByName,
  authenticateToken,
};
