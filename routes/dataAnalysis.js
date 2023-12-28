var express=require('express')
const CheckAuth=require('../Middleware/check_auth');
const middle = express.urlencoded({ extended: true })
const user = (con) => {
const router = express.Router();
// View All data...
router.get("/",middle,(req,res)=>{
    // const location=req.body.location;
     const interestID=req.body.interestID;
     const Date=req.body.Date;
   // con.query('select user.userID,sensors.sensorType,data_collection.value,data_collection.time,data_collection.date  from data_collection,interests,user,sensors where data_collection.interestID=interests.InterestID and interests.userID =user.userID and interests.sensorID =sensors.sensorsID ',(err,result)=>{
        
    con.query('select data_collection.value,data_collection.time from data_collection,interests,user,sensors where data_collection.interestID=interests.InterestID and interests.userID =user.userID and interests.sensorID =sensors.sensorsID ',(err,result)=>{
        if(err){
            console.log(err)
            return res.status(500).json({
                error:err
            });
        }else{
            if(result==''){
                return res.status(200).send({
                    message: "Not found"
                })
            }
            return res.status(200).json({
                result 
                 
            });
        }
    })
})

 return router;
}


module.exports = user;