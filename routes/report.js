require('dotenv').config();
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const EMAIL = 's11923966@stu.najah.edu';
const PASSWORD = 'Pass*word1';
const util = require("util");
const {getUserByName,authenticateToken, deleteUserByName} = require('../Middleware/reportFun.js');
const check_auth = require('../Middleware/check_auth.js');
const con=require('../config/config');
 const reporting = async (req, res, next) => {
  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

        try {
          const user = await getUserByName(req.name);
          const email = user.email;
          const environmental_issue = req.body.environmental_issue;
          const description = req.body.description;

          let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: EMAIL,
              pass: PASSWORD,
            },
          });

          let MailGenerator = new Mailgen({
            theme: "default",
            product: {
              name: "Ecotrack",
              link: "https://mailgen.js/",
            },
          });

          let response = {
            body: {
              name: "Reporting",
              intro: "You have got a report from " + req.name,
              table: {
                data: [
                  {
                    User_Name: req.name,
                    Environmental_Issue: environmental_issue,
                    Description: description,
                  },
                ],
              },
              outro: "Have a nice day",
            },
          };

          let mail = MailGenerator.generate(response);

          let message = {
            from: email,
            to: EMAIL,
            subject: "Reporting",
            html: mail,
          };

          await transporter.sendMail(message);

          // Insert the user into the database
          con.query(
            "INSERT INTO report (user_id, userName, environmental_issue, description) VALUES (?, ?, ?, ?)",
            [user.userID, req.name, environmental_issue, description],
            (err, results) => {
              if (err) {
                console.error("Error storing report in the database:", err);
                return res.status(500).json({ error: "Internal server error" });
              }

              console.log("Report and Email Sent Successfully.");
              return res.status(200).json({
                msg1: "The report has been added successfully to database",
                msg2: "The report has been sent successfully to the admin's email",
              });
            }
          );
        } catch (error) {
          console.error("Error in reporting:", error);
          return res.status(500).json({
            error: "Internal server error",
          });
        }
      }

   catch (error) {
    console.error("Error in reporting:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};


const getAllReports = async (req, res, next) => {
  const queryAsync = util.promisify(con.query).bind(con);
  const reports = await queryAsync("SELECT * FROM report");

  const formattedReports = reports.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    // Continue with the code, as the JWT verification was successful

    console.log("Getting all the Reports Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting all the Reports Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsByReportID = async (req, res, next) => {
  const reportID = req.body.reportID; // reportID is passed as a parameter

  const queryAsync = util.promisify(con.query).bind(con);
  const report = await queryAsync("SELECT * FROM report WHERE reportID = ?", [
    reportID,
  ]);

  if (!report || report.length === 0) {
    return res.status(404).json({
      error: "Report not found",
    });
  }

  const formattedReports = report.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    // Continue with the code, as the JWT verification was successful

    console.log("Getting Report by ReportID Successfully.");

    // Send the report as a JSON response
    return res.status(200).json({
      msg: "Getting Report by ReportID Successfully.",
      Report: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the report:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsByUserID = async (req, res, next) => {
  const userID = req.body.user_id; // user_id is passed as a parameter

  const queryAsync = util.promisify(con.query).bind(con);
  const reports = await queryAsync("SELECT * FROM report WHERE user_id = ?", [
    userID,
  ]);

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: "Reports not found for the specified user",
    });
  }

  const formattedReports = reports.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports by UserID Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports by UserID Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsByIssue = async (req, res, next) => {
  const environmentalIssue = req.body.environmental_issue.toLowerCase(); // Convert to lowercase

  const queryAsync = util.promisify(con.query).bind(con);
  const reports = await queryAsync(
    "SELECT * FROM report WHERE LOWER(environmental_issue) = ?",
    [environmentalIssue]
  );

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: "Reports not found for the specified environmental issue",
    });
  }

  const formattedReports = reports.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");
    // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports by Environmental Issue Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports by Environmental Issue Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsBetweenTwoDates = async (req, res, next) => {
  try {
    const startDate = req.body.start_date; //  start_date is passed as a parameter
    const endDate = req.body.end_date; //  end_date is passed as a parameter

    const queryAsync = util.promisify(con.query).bind(con);
    const reports = await queryAsync(
      "SELECT * FROM report WHERE created_at BETWEEN ? AND ?",
      [startDate, endDate]
    );

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        error: "Reports not found between the specified dates",
      });
    }

    const formattedReports = reports.map(formatReport);

    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports between Two Dates Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports between Two Dates Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsByDate = async (req, res, next) => {
  try {
    const targetDate = req.body.target_date; //  target_date is passed as a parameter

    const queryAsync = util.promisify(con.query).bind(con);
    const reports = await queryAsync(
      "SELECT * FROM report WHERE DATE(created_at) = ?",
      [targetDate]
    );

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        error: "Reports not found for the specified date",
      });
    }

    const formattedReports = reports.map(formatReport);

    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");
    // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports for the Specified Date Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports for the Specified Date Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsByDateAndBetweenTwoTimes = async (req, res, next) => {
  try {
    const targetDate = req.body.target_date; //  target_date is passed as a parameter
    const startTime = req.body.start_time; //  start_time is passed as a parameter
    const endTime = req.body.end_time; //  end_time is passed as a parameter

    console.log("Received request body:", req.body);

    const startDateTime = `${targetDate} ${startTime}`;
    const endDateTime = `${targetDate} ${endTime}`;

    const queryAsync = util.promisify(con.query).bind(con);
    const reports = await queryAsync(
      "SELECT * FROM report WHERE created_at BETWEEN ? AND ?",
      [startDateTime, endDateTime]
    );

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        error:
          "Reports not found between the specified times on the specified date",
      });
    }

    const formattedReports = reports.map(formatReport);

    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    // Continue with the code, as the JWT verification was successful

    console.log(
      "Getting Reports between Two Times on a Specific Date Successfully."
    );

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports between Two Times on a Specific Date Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsBetweenTwoTimes = async (req, res, next) => {
  const startTime = req.body.start_time; //  start_time is passed as a parameter
  const endTime = req.body.end_time; //  end_time is passed as a parameter

  const queryAsync = util.promisify(con.query).bind(con);
  const reports = await queryAsync(
    `
    SELECT * FROM report 
    WHERE 
      TIME(created_at) BETWEEN ? AND ?
  `,
    [startTime, endTime]
  );

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: "Reports not found between the specified times",
    });
  }

  const formattedReports = reports.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

      // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports between Two Times Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports between Two Times Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsBetweenTwoTimesAndDates = async (req, res, next) => {
  const startDate = req.body.start_date; //  start_date is passed as a parameter
  const endDate = req.body.end_date; //  end_date is passed as a parameter
  const startTime = req.body.start_time; //  start_time is passed as a parameter
  const endTime = req.body.end_time; //  end_time is passed as a parameter

  const queryAsync = util.promisify(con.query).bind(con);
  const reports = await queryAsync(
    `
    SELECT * FROM report 
    WHERE 
      created_at BETWEEN ? AND ? AND
      TIME(created_at) BETWEEN ? AND ?
  `,
    [startDate, endDate, startTime, endTime]
  );

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: "Reports not found between the specified times and dates",
    });
  }

  const formattedReports = reports.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports between Two Times and Dates Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports between Two Times and Dates Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsFromStartDateAndTimeToEndDateAndTime = async (
  req,
  res,
  next
) => {
  const startDateTime = `${req.body.start_date} ${req.body.start_time}`;
  const endDateTime = `${req.body.end_date} ${req.body.end_time}`;

  const queryAsync = util.promisify(con.query).bind(con);
  const reports = await queryAsync(
    `
    SELECT * FROM report 
    WHERE 
      created_at BETWEEN ? AND ?
  `,
    [startDateTime, endDateTime]
  );

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: "Reports not found between the specified times and dates",
    });
  }

  const formattedReports = reports.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

      // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports between Two Times and Dates Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports between Two Times and Dates Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getReportsByTime = async (req, res, next) => {
  const reportTime = req.body.report_time;

  const queryAsync = util.promisify(con.query).bind(con);
  const reports = await queryAsync(
    `
    SELECT * FROM report 
    WHERE 
      TIME(created_at) = ?
  `,
    [reportTime]
  );

  if (!reports || reports.length === 0) {
    return res.status(404).json({
      error: "Reports not found for the specified time",
    });
  }

  const formattedReports = reports.map(formatReport);

  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

    
    // Continue with the code, as the JWT verification was successful

    console.log("Getting Reports by Time Successfully.");

    // Send the reports as a JSON response
    return res.status(200).json({
      msg: "Getting Reports by Time Successfully.",
      Reports: formattedReports,
    });
  } catch (error) {
    console.error("Error in getting the reports:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const deleteMyAccount = async (req, res, next) => {
  try {
    await authenticateToken(req, res, next);
    console.log("JWT Verification Successful.");

        try {
          const userName = req.name; 

          // Perform the account deletion in the database
          const result = deleteUserByName(userName);
          // Check if the account was successfully deleted
          if (!result) {
            return res.status(404).json({
              error: "User account not found",
            });
          }

          console.log("User account deleted successfully.");
           // Send a success message as JSON response
          return res.status(200).json({
            msg: "User account deleted successfully.",
          });
        } catch (error) {
          console.error("Error in deleting:", error);
          res.status(500).json({
            error: "Internal server error",
          });
        }
      }
    
    catch (error) {
        console.error("Error in deleting user account:", error);
        res.status(500).json({
          error: "Internal server error",
        });
      }
};

// Function to format a single report
function formatReport(report) {
  return {
    ...report,
    created_at: {
      date: formatDate(new Date(report.created_at)),
      time: new Date(report.created_at).toLocaleTimeString(),
    },
  };
}

// Function to format date as "YYYY-MM-DD"
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  reporting,
  getAllReports,
  getReportsByReportID,
  getReportsByUserID,
  getReportsByIssue,
  getReportsBetweenTwoDates,
  getReportsByDate,
  getReportsByDateAndBetweenTwoTimes,
  getReportsBetweenTwoTimes,
  getReportsBetweenTwoTimesAndDates,
  getReportsFromStartDateAndTimeToEndDateAndTime,
  getReportsByTime,
  deleteMyAccount
};

