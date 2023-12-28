const nodemailer = require('nodemailer');
module.exports = (toEmail,subject,text, res) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 's11923966@stu.najah.edu',
            pass: 'Pass*word1'
        }
        });
        
        var mailOptions = {
        from: 's11923966@stu.najah.edu',
        to: toEmail,
        subject:subject,
        text: text
        };
        
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).send("the email is send")
        }
        });
};

