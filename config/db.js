const mysql = require('mysql');

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "myAPI"
});


db.getConnection(()=> {
console.log("connected to database successfully");
})
module.exports = db;