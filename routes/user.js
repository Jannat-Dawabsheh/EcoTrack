var express=require('express')
const bcrypt = require('bcrypt');
const validator = require('email-validator');
//const EmailValidator=require('../Middleware/EmailValidator');
const jwt = require('jsonwebtoken');
const sendingEmail=require('../Middleware/sendEmail');
const user = (con) => {
const router = express.Router();


router.post('/signup',(req,res)=>{
    const Username=req.body.name;
    const Userpassword=req.body.password;
    const UserEmail=req.body.email;
    const UserLocation=req.body.location;
    const score=0;

    // check if all data filled...
     if (!Username || !Userpassword || !UserEmail || !UserLocation){
      return res.status(400).send({
      message: "Please fill the missing data."
      })
    }

    else{
     // check if the email is valid...
   const valid=validator.validate(UserEmail);
    if(!valid){
        return res.status(400).json({ message: "Please provide a valid email address"});
    }else{ // check if the email is already registered...
       con.query('select email from user where email=?', UserEmail,(err,result)=>{
          if(err){
            console.log(err)
            return res.status(500).json({
                 error:err
            });
        }else{
            if(!(result=='')){
                console.log(result)
                return res.status(409).json({message: "this user is already signed!" });
            }else{ // check if the user name is already used...

              con.query('select name from user where name=?', Username,(err,result)=>{
                if(err){
                    console.log(err)
                    return res.status(500).json({
                        error:err
                    });
                }else{
                    if(!(result=='')){
                        res.send("this username reserved for someone else please enter another name.")
                        console.log(result)
                    }
                    else{ // hash the password...
                        bcrypt.hash(Userpassword,10,(err,hash)=>{
                            if(err){
                                console.log(err)
                                return res.status(500).json({
                                    error:err
                                });

                            }else{// insert new user to database...
                                con.query('insert into user  (name,password,email,location,score) values(?,?,?,?,?)',[Username,hash,UserEmail,UserLocation,score],(err,result)=>{
                                    if(err){
                                        console.log(err)
                                        return res.status(500).json({
                                          error:err
                                        });
                                    }else{
                                        sendingEmail(UserEmail,'Sending Email From Echotarck','You are registered to echotrack system successfully');
                                        return res.status(201).json({ message: "Added successfully "});
                                    }
                                })
                            }
                        });
                    }
                }
              })
            }
        }
       })
    }  
    }
      
}) //end of signup..


router.post("/login",(req,res)=>{
    const Username=req.body.name;
    const password=req.body.password;
    // check if all data filled...
    if (!Username || !password ){
        return res.status(400).send({
        message: "Please fill the missing data."
        })
      }
    else{
    //check if this user registered...
    con.query('select * from user WHERE name=?',Username,(err,result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({
                error:err
            });
        }else{
            if(result==''){
                res.status(401).send("this User is not registered")
                console.log("this User is not registered")
            }else{// check if password is correct...
                bcrypt.compare(password, result[0].password, (err, result2) => {
                    if (err) {
                        return res.status(401).json({message: "Auth failed" });
                    }else{ // generate a token...
                        if(result2){
                                const token = jwt.sign(
                                  {
                                    name: result[0].name,
                                    email: result[0].email,
                                    
                                  },
                                  'secret',
                                  {
                                      expiresIn: "1h"
                                  }
                                );
                                return res.status(200).json({
                                  message: "Auth successfully",
                                  token: token
                                });

                        }else{
                            return res.status(401).json({message: "wrong password" });  
                        }
                    }
                })       
            }
        }
    })
}
})

 return router;
}


module.exports = user;