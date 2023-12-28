

const jwt = require('jsonwebtoken');

module.exports=(req, res, next)=> {
    try {
        const token = req.headers.token.split("\"")[1];
        const decoded = jwt.verify(token, 'secret');
        req.userData = decoded;
       // res.send ("name: "+JSON.stringify(decoded).split('\"')[3] + ', Email: '+JSON.stringify(decoded).split('\"')[7]);
        return JSON.stringify(decoded).split('\"')[3]+'+'+JSON.stringify(decoded).split('\"')[7];  

       
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};


