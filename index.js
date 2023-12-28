const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'myAPI',
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

app.use(express.json());

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password, email, location } = req.body;

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate password strength
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  // Check if email already exists
  const emailExists = await checkEmailExists(email);

  if (emailExists) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  // Check if username is unique
  const usernameExists = await checkUsernameExists(username);

  if (usernameExists) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the user into the database
  db.query(
    'INSERT INTO user (name, email, password, location) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, location],
    (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Send email verification
     // sendVerificationEmail(email);

      res.json({ message: 'User registered successfully' });
    }
  );
}); 

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
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
  
      const token = jwt.sign({ userId: user.userID }, 'your-secret-key', { expiresIn: '1h' });
  
      res.json({ token });
    });
  });

  app.get('/profile', verifyToken, (req, res) => {
    const userId = req.userId;
  
    db.query('SELECT userID, name, email, location, score FROM user WHERE userID = ?', [userId], (err, results) => {
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
app.put('/profile/username', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { newUsername } = req.body;

  const usernameExists = await checkUsernameExists(newUsername);

  if (usernameExists) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  db.query('UPDATE user SET name = ? WHERE userID = ?', [newUsername, userId], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json({ message: 'Username updated successfully' });
  });
});

// Update password
app.put('/profile/password', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { newPassword } = req.body;

  // Validate password strength
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  db.query('UPDATE user SET password = ? WHERE userID = ?', [hashedPassword, userId], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json({ message: 'Password updated successfully' });
  });
});

// get interests for the given user ID
  app.get('/interests', verifyToken, (req, res) => {
    const userId = req.userId;
  
    const query = `
      SELECT interests.interestID, sensors.sensorType, interests.threshold
      FROM interests
      JOIN sensors ON interests.sensorID = sensors.sensorID
      WHERE interests.userID = ?
    `;

    console.log('SQL Query:', query, [userId]);

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
        
      }
  
      res.json(results);
    });
  });

// view sensors, can be accessed by all 
app.get('/sensors', (req, res) => {
  const query = 'SELECT * FROM sensors';

  db.query(query, (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json(results);
  });
});

app.post('/interests', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { sensorID, threshold } = req.body;

  const interestExists = await checkInterest(userId, sensorID);

  if (interestExists) {
    return res.status(400).json({ error: 'Interest already exists for this user and sensor' });
  }

  db.query('INSERT INTO interests (sensorID, userID, threshold) VALUES (?, ?, ?)', [sensorID, userId, threshold], (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ message: 'Sensor added successfully' });
  });
});

/*
app.post('/dataCollection', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { sensorID, value } = req.body;

  const sensorExists = await checkInterest(userId, sensorID);

  if (!sensorExists) {
    return res.status(400).json({ error: 'Sensor not added for this user' });
  }

  const interestID = await getInterestId(userId, sensorID);
  if (!interestID) {
    return res.status(400).json({ error: 'Interest not found for this sensor and user' });
  }

  db.query('INSERT INTO data_collection (interestID, value, date, time) VALUES (?, ?, CURDATE(), CURTIME())', [interestID, value], async (err, results) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }

    await incrementUserScore(userId, 10);
    res.json({ message: 'Data added to dataCollection successfully' });
  });
});

*/

app.post('/dataCollection', verifyToken, async (req, res) => {
  const userId = req.userId;
  const { sensorID, value } = req.body;

  // Check if the sensor exists in the user's interests
  const sensorExists = await checkInterests(userId, sensorID);

  if (!sensorExists) {
    return res.status(400).json({ error: 'Sensor not added for this user' });
  }

  // Get interest details for the specified sensor and user
  const interestQuery = 'SELECT interestID, threshold FROM interests WHERE userID = ? AND sensorID = ?';
  db.query(interestQuery, [userId, sensorID], async (err, interestResults) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }

    if (interestResults.length === 0) {
      return res.status(400).json({ error: 'Interest not found for this sensor and user' });
    }

    const { interestID, threshold } = interestResults[0];

    // Insert data into data_collection table
    const insertDataQuery =
      'INSERT INTO data_collection (interestID, value, date, time) VALUES (?, ?, CURDATE(), CURTIME())';
    db.query(insertDataQuery, [interestID, value], async (insertErr, insertResults) => {
      if (insertErr) {
        console.error('MySQL query error:', insertErr);
        return res.status(500).json({ error: 'Internal Server Error', details: insertErr.message });
      }
      await incrementUserScore(userId, 10);

      // Check if the user-added value is larger by 10 or more than the threshold
      if ((value >= threshold + 10) || (value <= threshold - 10)) 
        sendingEmail(email,'From Echotarck','your value: (${value})is far from the threshold : (${threshold})');
      
      res.json({ message: 'Data added to dataCollection successfully' });
    });
  });
});



app.get('/OpenData', async (req, res) => {
  const { sensorType, location, date } = req.body;

  // Get user ID based on location
  const userIdQuery = `
    SELECT userID
    FROM user
    WHERE location = ?
  `;

  db.query(userIdQuery, [location], (err, userIdResult) => {
    if (err) {
      console.error('MySQL query error:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }

    if (userIdResult.length === 0) {
      return res.status(404).json({ error: 'User not found for the specified location' });
    }

    const userId = userIdResult[0].userID;

    const sensorDataQuery = `
      SELECT data_collection.value, data_collection.date, data_collection.time
      FROM data_collection
      JOIN interests ON data_collection.interestID = interests.interestID
      JOIN sensors ON interests.sensorID = sensors.sensorID
      WHERE sensors.sensorType = ? AND interests.userID = ? AND data_collection.date = ?
      ORDER BY data_collection.time
    `;

    db.query(sensorDataQuery, [sensorType, userId, date], (err, sensorData) => {
      if (err) {
        console.error('MySQL query error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
      }

      const formattedData = sensorData.map((entry) => {
        return { date: entry.date, time: entry.time, value: entry.value };
      });

      res.json({ results: formattedData });
    });
  });
});





function checkInterest(userId, sensorID) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM interests WHERE userID = ? AND sensorID = ?', [userId, sensorID], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        reject(err);
      }
      resolve(results.length > 0);
    });
  });
}

// get the interestID for the specified sensor and user
async function getInterestId(userId, sensorId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT interestID FROM interests WHERE userID = ? AND sensorID = ?';

    db.query(query, [userId, sensorId], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        reject(err);
      }

      resolve(results.length > 0 ? results[0].interestID : null);
    });
  });
}


async function incrementUserScore(userId, scoreIncrement) {
  const [user] = await getUserById(userId);
  if (!user) {
    return;
  }
  const currentScore = user.score || 0;
  const newScore = currentScore + scoreIncrement;
  await updateScore(userId, newScore);
}

function getUserById(userId) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM user WHERE userID = ?', [userId], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        reject(err);
      }

      resolve(results);
    });
  });
}

function updateScore(userId, newScore) {
  return new Promise((resolve, reject) => {
    db.query('UPDATE user SET score = ? WHERE userID = ?', [newScore, userId], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        reject(err);
      }

      resolve(results);
    });
  });
}
  
  // verify JWT token
  function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
  
    if (!token) {
      return res.status(403).json({ error: 'Token not provided' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
  
      req.userId = decoded.userId;
      next();
    });
  }


// check if email already exists
function checkEmailExists(email) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('MySQL query error:', err);
        reject(err);
      }

      resolve(results.length > 0);
    });
  });
}

// check if username is unique
function checkUsernameExists(username) {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM user WHERE name = ?', [username], (err, results) => {
      if (err) { 
        console.error('MySQL query error:', err);
        reject(err);
      }

      resolve(results.length > 0);
    });
  });
}


function sendVerificationEmail(email) {
  const transporter = nodemailer.createTransport({
    service: 'your-email-provider',
    auth: {
      user: 'your-email-username',
      pass: 'your-email-password',
    },
  });

  const mailOptions = {
    from: 'your-email-username',
    to: email,
    subject: 'Email Verification',
    text: 'Please verify your email to activate your account.',
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Email sending error:', err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
  return password.length >= 8;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
 