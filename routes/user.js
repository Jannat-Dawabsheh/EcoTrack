var express=require('express')
const bcrypt = require('bcrypt');
const validator = require('email-validator');
const CheckAuth=require('../Middleware/check_auth');
const signupValidation=require('../Middleware/signup_validation');
const score=require('../Middleware/scores');
//const EmailValidator=require('../Middleware/EmailValidator');
const jwt = require('jsonwebtoken');
const sendingEmail=require('../Middleware/sendEmail');
const user = (con) => {
const router = express.Router();


const user = (con) => {
  const router = express.Router();
  
  // Signup route
  router.post('/signup', async (req, res) => {
      const { name, password, email, location } = req.body;
    
      // Validate email format
      const isValidEmail=validator.validate(email);
      if (!isValidEmail) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    
      // Validate password strength
      if (!signupValidation.isValidPassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }
    
      // Check if email already exists
      const emailExists = await signupValidation.checkEmailExists(email);
    
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    
      // Check if username is unique
      const usernameExists = await signupValidation.checkUsernameExists(name);
    
      if (usernameExists) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
    
      // Insert the user into the database
      con.query(
        'INSERT INTO user (name, email, password, location) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, location],
        (err, results) => {
          if (err) {
            console.error('MySQL query error:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
    
          // Send email verification
          sendingEmail(email,'Sending Email From Echotarck','You are registered to echotrack system successfully');
          res.json({ message: 'User registered successfully' });
        }
      );
    });
  
  // Login route
  router.post('/login', async (req, res) => {
      const { email, password } = req.body;
    
      con.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
    
        if (results.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        const user = results[0];
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        const token = jwt.sign({ userId: user.userID, name: user.name, email: user.email   }, 'your-secret-key', { expiresIn: '1h' });
    
        res.json({ token });
      });
    });
  
  router.get('/profile', CheckAuth, (req, res) => {
      const userId = req.userId;
    
      con.query('SELECT userID, name, email, location, score FROM user WHERE userID = ?', [userId], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
    
        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        const user = results[0];
    
        delete user.password;
    
        res.json(user);
      });
    });
  
  
    // Update username
  router.put('/profile/username', CheckAuth, async (req, res) => {
    const userId = req.userId;
    const { newUsername } = req.body;
  
    const usernameExists = await signupValidation.checkUsernameExists(newUsername);
  
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already exists' });
    }
  
    con.query('UPDATE user SET name = ? WHERE userID = ?', [newUsername, userId], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.json({ message: 'Username updated successfully' });
    });
  });
  
  // Update password
  router.put('/profile/password', CheckAuth, async (req, res) => {
    const userId = req.userId;
    const { newPassword } = req.body;
  
    // Validate password strength
    if (!signupValidation.isValidPassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
  
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    con.query('UPDATE user SET password = ? WHERE userID = ?', [hashedPassword, userId], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.json({ message: 'Password updated successfully' });
    });
  });
  
    // view sensors, can be accessed by all 
  router.get('/sensors', (req, res) => {
      const query = 'SELECT * FROM sensors';
    
      con.query(query, (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
    
        res.json(results);
      });
    });
  
  
    router.post('/interests', CheckAuth, async (req, res) => {
      const userId = req.userId;
      const { sensorID, threshold } = req.body;
    
      const interestExists = await checkInterest(userId, sensorID);
    
      if (interestExists) {
        return res.status(400).json({ error: 'Interest already exists for this user and sensor' });
      }
    
      con.query('INSERT INTO interests (sensorID, userID, threshold) VALUES (?, ?, ?)', [sensorID, userId, threshold], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Sensor added successfully' });
      });
    });
  
  // get interests for the given user ID
  router.get('/interests', CheckAuth, (req, res) => {
    const userId = req.userId;
  
    const query = `
      SELECT interests.interestID, sensors.sensorType, interests.threshold
      FROM interests
      JOIN sensors ON interests.sensorID = sensors.sensorsID
      WHERE interests.userID = ?
    `;
  
    console.log('SQL Query:', query, [userId]);
  
    con.query(query, [userId], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
        
      }
      res.json(results);
    });
  });
  
  router.post('/interests', CheckAuth, async (req, res) => {
    const userId = req.userId;
    const { sensorID, threshold } = req.body;
  
    const interestExists = await checkInterest(userId, sensorID,con);
  
    if (interestExists) {
      return res.status(400).json({ error: 'Interest already exists for this user and sensor' });
    }
  
    con.query('INSERT INTO interests (sensorID, userID, threshold) VALUES (?, ?, ?)', [sensorID, userId, threshold], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json({ message: 'Sensor added successfully' });
    });
  });
  
  router.post('/dataCollection', CheckAuth, async (req, res) => {
      const userId = req.userId;
      const { sensorID, value } = req.body;
    
      // Check if the sensor exists in the user's interests
      const sensorExists = await checkInterest(userId, sensorID);
    
      if (!sensorExists) {
        return res.status(400).json({ error: 'Sensor not added for this user' });
      }
    
      // Get interest details for the specified sensor and user
      const interestQuery = 'SELECT interestID, threshold FROM interests WHERE userID = ? AND sensorID = ?';
      con.query(interestQuery, [userId, sensorID], async (err, interestResults) => {
        if (err) {
          console.error('MySQL query error:', err);
          return res.status(500).json({ error: 'Internal Server Error', details: err.message });
        }
    
        if (interestResults.length === 0) {
          return res.status(400).json({ error: 'Interest not found for this sensor and user' });
        }
    
        const { interestID, threshold } = interestResults[0];
    
       
        const insertData =
          'INSERT INTO data_collection (interestID, value, date, time) VALUES (?, ?, CURDATE(), CURTIME())';
  
        con.query(insertData, [interestID, value], async (insertErr, insertResults) => {
          if (insertErr) {
            console.error('MySQL query error:', insertErr);
            return res.status(500).json({ error: 'Internal Server Error', details: insertErr.message });
          }
          await score(userId, 10);
    
  
          if ((value >= threshold + 10) || (value <= threshold - 10)) {
            const userEmail = await getUserEmail(userId);
            sendingEmail(userEmail,'From Echotarck','your value: '+ value+' is far from the threshold : '+threshold);
          
          }
            
          res.json({ message: 'Data added to dataCollection successfully' });
        });
      });
  });
   return router;
  }
  
  function getUserEmail(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT email FROM user WHERE userID = ?';
  
      con.query(query, [userId], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          reject(err);
        }
  
        resolve(results.length > 0 ? results[0].email : null);
      });
    });
  }
  
  function checkInterest(userId, sensorID) {
    return new Promise((resolve, reject) => {
      con.query('SELECT * FROM interests WHERE userID = ? AND sensorID = ?', [userId, sensorID], (err, results) => {
        if (err) {
          console.error('MySQL query error:', err);
          reject(err);
        }
        resolve(results.length > 0);
      });
    });
  }
 return router;
}
function checkInterest(userId, sensorID,con) {
  return new Promise((resolve, reject) => {
    con.query('SELECT * FROM interests WHERE userID = ? AND sensorID = ?', [userId, sensorID], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        reject(err);
      }
      resolve(results.length > 0);
    });
  });
}


module.exports = user;