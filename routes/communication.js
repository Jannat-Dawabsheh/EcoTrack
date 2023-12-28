var express=require('express')
const CheckAuth=require('../Middleware/check_auth');
const validator = require('email-validator');
const sendingEmail=require('../Middleware/sendEmail');
const chat = require('../Middleware/chat');
const middle = express.urlencoded({ extended: true })
const user = (con) => {
const router = express.Router();

// Start Email chatting...
router.post("/Emailchat",CheckAuth,middle,(req,res)=>{
    const userID=req.body.userID;
    const title=req.body.title;
    const content=req.body.content;
    con.query('select email from user where userID=?', userID,(err,result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({
                 error:err
            });
        }else{
            if(result==''){
                console.log(result)
                return res.status(409).json({message: "this user not exist!" });
            }else{ 
                var email=JSON.stringify(result).split(":")[1].split("}")[0];
                const r=chat(req,res).split('+');
                console.log(r);
                const newContent="this message from EcoTrack user :  "+ r[0]+" with email "+ r[1]+"\n\n  "+content;
                sendingEmail(email,title,newContent);    
            } 
        }

    })
})

// Start msg chatting...
router.post("/msgchat",CheckAuth,middle,(req,res)=>{
    const reciverID=req.body.reciverID;
    const content=req.body.content;
    con.query('select userID from user where userID=?', reciverID,(err,result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({
                 error:err
            });
        }else{
            if(result==''){
                console.log(result)
                return res.status(409).json({message: "this user not exist!" });
            }else{ 
                const r=chat(req,res).split('+'); 
                //var senderName=r[0];
                var senderID;
                con.query('select userID from user where name=?', r[0],(err,sID)=>{
                    senderID=JSON.stringify(sID).split(':')[1].split('}')[0];
                    var dateTime=new Date();
                    var CurDate=dateTime.getFullYear() + "-" + dateTime.getMonth() + "-" + dateTime.getDate();
                    var CurTime=dateTime.getHours() + ":" + dateTime.getMinutes() + ":" + dateTime.getSeconds();
                    con.query('insert into chat  (senderID,reciver,msg,Date,time) values(?,?,?,?,?)',[senderID,reciverID,content,CurDate,CurTime],(err,result)=>{
                        if(err){
                            console.log(err)
                            return res.status(500).json({
                            error:err
                            });
                        }
                    })
                    
                }) 

            } 
        }

    })
})

// view msg chatting...
router.get("/msgchat/",CheckAuth,middle,(req,res)=>{
    const r=chat(req,res).split('+'); 

        con.query('select userID from user where name=?',r[0],(err,result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({
                error:err
            });
        }else{
            var reciverID=JSON.stringify(result).split(':')[1].split('}')[0];
            console.log(reciverID);
           con.query('select senderID,msg,Date,time from chat where reciver=?',reciverID,(err,result)=>{
                if(err){
                    console.log(err)
                    return res.status(500).json({
                        error:err
                    });
                }else{            
                    return res.status(200).json({
                        result    
                    });
                }
            })
        }
       })
    
})

 return router;
}


module.exports = user;