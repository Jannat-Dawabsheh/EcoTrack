var express=require('express')
const CheckAuth=require('../Middleware/check_auth');
const sendingEmail=require('../Middleware/sendEmail');
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
                const newContent="this message from EcoTrack user :  "+ req.name+" with email "+ req.email+"\n\n  "+content;
                sendingEmail(email,title,newContent); 
                return res.status(200).send({
                    message: "Email sent"
                 })   
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
                    con.query('insert into chat  (senderID,reciver,msg,Date,time) values(?,?,?,CURDATE(), CURTIME())',[req.userId,reciverID,content],(err,result)=>{
                        if(err){
                            console.log(err)
                            return res.status(500).json({
                            error:err
                            });
                        }
                        else{
                            return res.status(200).send({
                                message: "message sent"
                             })
                        }
                    })

            } 
        }

    })
})

// view msg chatting...
router.get("/msgchat/",CheckAuth,middle,(req,res)=>{
          
           con.query('select senderID,msg,Date,time from chat where reciver=?',req.userId,(err,result)=>{
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
    
})

 return router;
}


module.exports = user;