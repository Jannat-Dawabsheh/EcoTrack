const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { EMAIL, PASSWORD } = require("./env");
var mysql = require("mysql");
var bcrypt = require("bcrypt");
const validator = require("validator");
var jwt = require("jsonwebtoken");
const util = require("util");


const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "ecotrack",
});

con.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("connected !!");
  }
});


// Function to get user by email from the database

function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    con.query("SELECT * FROM user WHERE email = ?", [email], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]); // Assuming we expect at most one user with the given email
      }
    });
  });
}
// Function to get user by name from the database
function getUserByName(name) {
  return new Promise((resolve, reject) => {
    con.query("SELECT * FROM user WHERE name = ?", [name], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result[0]); // Assuming we expect at most one user with the given name
      }
    });
  });
}
// Function to get user by password from the database
function getUserByPassword(password) {
  return new Promise((resolve, reject) => {
    con.query(
      "SELECT * FROM user WHERE password = ?",
      [password],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0]); // Assuming we expect at most one user with the given password
        }
      }
    );
  });
}

const signup = async (req, res, next) => {
  const name = req.body.name;
  const plaintextPassword = req.body.password;
  const email = req.body.email;
  const location = req.body.location;
  const score = req.body.score;

  // Check if the user name already exists in the database
  try {
    const existingUser = await getUserByName(name);
    if (existingUser) {
      return res.status(409).json({
        error: "This user name is already exists",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }

  // Check if the email is in a valid format
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      error: "Invalid email format",
    });
  }

  // Check if the email already exists in the database
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }

  // Check if the password is a string
  if (typeof plaintextPassword !== "string") {
    return res.status(400).json({
      error: "Invalid password format",
    });
  }

  // Hash the password
  bcrypt.hash(plaintextPassword, 10, (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        error: "Internal Server Error",
      });
    }

    // Create a transporter for sending emails
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    });

    // Create a Mailgen instance for generating HTML emails
    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Ecotrack",
        link: "https://mailgen.js/",
      },
    });

    // Define the content of the email
    let response = {
      body: {
        name: "Registration",
        intro: "You have successfully registered.",
        table: {
          data: [
            {
              name: name,
              email: email,
              location: location,
              score: score,
            },
          ],
        },
        outro: "Have a nice day",
      },
    };

    // Generate HTML content using Mailgen
    let mail = MailGenerator.generate(response);

    // Define the email message
    let message = {
      from: EMAIL,
      to: email,
      subject: "Registration",
      html: mail,
    };

    // Send the email and insert the user into the database in the promise chain
    transporter.sendMail(message, (error, info) => {
      if (error) {
        // Email sending failed, check the error message for a 550 response
        console.error(error);

        if (error.message.includes("550")) {
          // If the error message contains '550', return a specific error
          return res.status(550).json({
            msg: "The registration email is not correct",
          });
        } else {
          // Other errors, return a generic error
          return res.status(500).json({
            error: "Error sending registration email",
          });
        }
      } else {
        // Email sent successfully; insert the user into the database
        con.query(
          "INSERT INTO user (score, location, name, email, password) VALUES (?, ?, ?, ?, ?)",
          [score, location, name, email, hash],
          (err, result) => {
            if (err) {
              // If adding to the database fails, handle it here
              console.error(err);
              return res.status(500).json({
                error: "Internal Server Error",
              });
            } else {
              return res.status(201).json({
                msg: "User created and registration email sent",
              });
            }
          }
        );
      }
    });
  });
};

const refreshToken = async (req, res, next) => {
    const refresh_Token = req.body.refresh_Token;
  
    if (!refresh_Token) {
      return res.sendStatus(401); // Unauthorized
    }
  
    try {
      // Check if the refreshToken exists in the database
      con.query(
        "SELECT * FROM refreshtoken WHERE token = ?",
        [refresh_Token],
        (err, results) => {
          if (err) {
            console.error("Database query error:", err);
            return res.sendStatus(500); // Internal Server Error
          }
  
          if (results.length === 0) {
            console.log("Token not found in the database");
            return res.sendStatus(403); // Forbidden
          }
  
          // Verify the refresh token
          jwt.verify(
            refresh_Token,
            process.env.REFRESH_TOKEN_SECRET,
            (err, user) => {
              if (err) {
                console.error("JWT verification error:", err);
                return res.sendStatus(403); // Forbidden
              }
  
              // Generate a new access token
              const accessToken = generateAccessToken({ name: user.name });
  
              // Send the new access token in the response
              res.json({
                msg: "Success new token",
                accessToken: accessToken,
              });
            }
          );
        }
      );
    } catch (err) {
      console.error("Error in refreshToken function:", err);
      res.sendStatus(500); // Internal Server Error
    }
  };
  
const logout = async (req, res, next) => {
  const refresh_Token = req.body.token;

  // Remove the refreshToken from the database
  con.query(
    "DELETE FROM refreshtoken WHERE token = ?",
    [refresh_Token],
    (err, results) => {
      if (err) {
        console.error("Error deleting refreshToken from database:", err);
        return res.sendStatus(500);
      }

      if (results.affectedRows === 0) {
        console.log("Token not found in the database");
        return res.status(404).json({
          error: "Token not found in the database",
        });
      }

      console.log("Token successfully deleted from the database");
      return res.status(200).json({
        msg: "Success logout",
      });
    }
  );
};

const login = async (req, res, next) => {
    const name = req.body.name;
    const inputPassword = req.body.password;
  
    try {
      const trueName = await getUserByName(name);
  
      if (trueName) {
        const userID = trueName.userID;
  
        const passwordMatch = await bcrypt.compare(
          inputPassword,
          trueName.password
        );
  
        if (passwordMatch) {
          const user = { name: name };
          const accessToken = generateAccessToken(user);
          const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  
          con.query(
            "INSERT INTO refreshtoken (token,userName,user_id) VALUES (?,?,?)",
            [refreshToken, name, userID],
            (err, results) => {
              if (err) {
                console.error("Error storing refreshToken in database:", err);
                return res.sendStatus(500);
              }
  
              // Send tokens in the response
              res.status(200).json({
                msg: "Success login",
                accessToken: accessToken,
                refreshToken: refreshToken,
              });
            }
          );
        } else {
          res.status(401).json({
            error: "Wrong password",
          });
        }
      } else {
        res.status(404).json({
          error: "User not found",
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Internal server error",
      });
    }
  };

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15h" });
}

const authenticateToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];

  if (token == null) {
    console.error("Token not found in headers");
    return res.sendStatus(401);
  }

  console.log("Extracted token:", token);

  req.token = token;
  next();
};


const deleteMyAccount = async (req, res, next) => {
  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    jwt.verify(
      req.token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, data) => {
        if (err) {
          console.error("JWT Verification Error:", err);
          return res.status(403).json({ error: "Forbidden" });
        }

        try {
          const userName = data.name; 

          // Perform the account deletion in the database
          const result = deleteUserByName(userName);

          // Check if the account was successfully deleted
          if (!result) {
            return res.status(404).json({
              error: "User account not found",
            });
          }

          console.log("User account deleted successfully.");
        } catch (error) {
          console.error("Error in deleting:", error);
          res.status(500).json({
            error: "Internal server error",
          });
        }
      }
    );
    // Send a success message as JSON response
    return res.status(200).json({
      msg: "User account deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleting user account:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// function to delete a user by name from the database
const deleteUserByName = async (userName) => {
  const queryAsync = util.promisify(con.query).bind(con);

  const deleteResult = await queryAsync("DELETE FROM user WHERE name = ?", [
    userName,
  ]);

  return deleteResult.affectedRows > 0; // Check if any rows were affected
};


const updateMyAccount = async (req, res, next) => {
    const name = req.body.name;
    const plaintextPassword = req.body.password;
    const location = req.body.location;
    const score = req.body.score;
  
    try {
      await authenticateToken(req, res, next);
      console.log("JWT Verification Successful.");
  
      const data = jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET);
      const currentUsername = data.name;
  
      // Check if the username in the request matches the current username
      if (name === currentUsername) {
        const existingUser = await getUserByName(name);
        if (existingUser) {
          return res.status(409).json({
            error: "This username already exists",
          });
        }
      }
  
      // Hash the plaintext password before updating the database
      const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
  
      // Update user data in the database
      await updateUser(name, hashedPassword, location, score, currentUsername);
  
      // Send a success message as JSON response
      return res.status(200).json({
        msg: "User account updated successfully.",
      });
    } catch (error) {
      console.error("Error in updating user account:", error);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
  };
  
  // function to update a user in the database
  const updateUser = async (username, password, location, score, currentUsername) => {
    const queryAsync = util.promisify(con.query).bind(con);
  
    try {
      await queryAsync(
        "UPDATE user SET name = ?, password = ?, location = ?, score = ? WHERE name = ?",
        [username, password, location, score, currentUsername]
      );
    } catch (error) {
      console.error("Error in updateUser query:", error);
      throw error; // Rethrow the error for handling in the calling function
    }
  };
  

module.exports = {

  signup,
  getUserByEmail,
  getUserByPassword,
  getUserByName,
  login,
  authenticateToken,
  refreshToken,
  logout,
  deleteMyAccount,
  updateMyAccount,
  updateUser,
  deleteUserByName,
  generateAccessToken,
  getUserByPassword,
  getUserByEmail,

};
