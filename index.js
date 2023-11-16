const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("email-validator");
const con = require('./config/db');
const route = require('./Routes/router');


var app = express();
app.use(express.json());
app.use(route);
const JWT_SECRET = "my_secret_token";


app.post('/user/signup',(req,res)=>{

    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    const location = req.body.location;
    var passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
       

    // validate email address 
      const isValid = validator.validate(email);
      if (!isValid) 
        return res.status(400).json({ error: 'Email is not valid' });


    // check if email is already used     
      const sql = 'SELECT COUNT(*) AS count FROM user WHERE email = ?';

      con.query(sql, [email], (error, result) => {
         const count = result[0].count;
         const emailFound = count === 1;
         if(emailFound){
            return res.status(400).json({ error: 'Email is already used' });
         }
         if(error){
            console.log(error)
               }         
      })


    // validate password
        if(!password.match(passw)) return res.status(400).json({ error: 'password is not valid' });
      
    // encrypt password    
        const hash = bcrypt.hashSync(password, 4);
           
            con.query('insert into user (name,email,password,location) values(?,?,?,?)',
            [name,email,hash,location],(err,result) =>
            {   
              if(err){
                 console.log(err)
                    }
                    else{
                       res.send("You have successfully signed up !!");
                     }
             }
         )
      
       
        
})

app.post('/user/login',(req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
     

    const sqlQuery = 'SELECT * FROM user WHERE email = ?'

    if(email && password){

      con.query(sqlQuery, [email],(err, data) => {
        if(data.count > 0){
            for( var i =0; i < data.count ; i++){

                var stored_pass = data[i].password;

                bcrypt.compare(password, stored_pass, function(err, isMatch) {
                   if(err) throw err;
                   else if(!isMatch) res.send("Incorrect password");
                   else {
                    const usr = { name :data[i].name }; // json object 

                    const token = jwt.sign(
                     {usr},                
                     JWT_SECRET,           
                     {expiresIn : '1h'}    
                     );     

                     con.query('insert into refresh_tokens (user_id, token) values(?,?)', [data[i].userID, token], (err,result) =>{
                        if(err){
                            console.log(err)
                               }
                               else{
                                  res.send("token added");
                                }
                     }
                     )
                    res.json({
                     token: token
                    });

                    res.send("You have successfully signed in!");}

                });
            }
        }else{
          res.send("incorrect email address!");
        }
      })
    }else{
        res.send("Please enter Email address and password details!");
    }
})

app.delete('/user/delete/:name', (req, res) => {
    const deleteUser = req.params.id
    con.query('delete from user where name=?', deleteUser, (err, result) => {
        if(err){
            console.log(err)
        }else{
            res.send("deleted")
            console.log(result)
        }
    }
    )
});

app.listen(7700,(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("listening on port 7700 ...")
    }
}) 