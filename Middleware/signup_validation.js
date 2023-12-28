
// check if email already exists
function checkEmailExists(email,con) {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          reject(err);
        }
  
        resolve(results.length > 0);
      });
    });
  }
  
  // check if username is unique
  function checkUsernameExists(username,con) {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM user WHERE name = ?', [username], (err, results) => {
        if (err) { 
          console.error('MySQL query error:', err);
          reject(err);
        }
  
        resolve(results.length > 0);
      });
    });
  }
  
  function isValidPassword(password) {
    return password.length >= 8;
  }
  
  module.exports = { isValidPassword ,checkUsernameExists,checkEmailExists};