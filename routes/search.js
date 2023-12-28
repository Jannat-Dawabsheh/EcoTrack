var express=require('express')
const CheckAuth=require('../Middleware/check_auth');
const middle = express.urlencoded({ extended: true })
const user = (con) => {
const router = express.Router();
// Search by location...
router.get("/Location",CheckAuth,(req,res)=>{
    const location=req.body.location;
    const Date=req.body.Date;
    con.query('select user.userID,sensors.sensorType,data_collection.value,data_collection.time from data_collection,interests,user,sensors where data_collection.interestID=interests.InterestID and interests.userID =user.userID and interests.sensorID =sensors.sensorsID and user.location=? and data_collection.date=?',[location,Date],(err,result)=>{
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

// Search by interests...
router.get("/interest",CheckAuth,(req,res)=>{
    const interest=req.body.interest;
    const Date=req.body.Date;
    con.query('select user.userID,user.location,data_collection.value,data_collection.time from data_collection,interests,user,sensors where data_collection.interestID=interests.InterestID and interests.userID =user.userID and interests.sensorID =sensors.sensorsID and sensors.sensorsID=? and data_collection.date=?',[interest,Date],(err,result)=>{
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
                 
            })
        }
    })
})

// Search by interests and location...
router.get("/interestAndLocation",CheckAuth,(req,res)=>{
    const interest=req.body.interest;
    const location=req.body.location;
    const Date=req.body.Date;
    con.query('select user.userID,data_collection.value,data_collection.time from data_collection,interests,user,sensors where data_collection.interestID=interests.InterestID and interests.userID =user.userID and interests.sensorID =sensors.sensorsID and user.location=? and sensors.sensorsID=? and data_collection.date=?',[location,interest,Date],(err,result)=>{
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