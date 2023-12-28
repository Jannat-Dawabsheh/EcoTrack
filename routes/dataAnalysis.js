var express=require('express')
const CheckAuth=require('../Middleware/check_auth');
const middle = express.urlencoded({ extended: true })
const user = (con) => {
const router = express.Router();
// View All data...
router.get("/",(req,res)=>{
    const interest=req.body.interest;
    const location=req.body.location;
    const Date=req.body.Date;
    con.query('select data_collection.value,data_collection.time from data_collection,interests,user,sensors where data_collection.interestID=interests.InterestID and interests.userID =user.userID and interests.sensorID =sensors.sensorsID and user.location=? and sensors.sensorsID=? and data_collection.date=?',[location,interest,Date],(err,result)=>{
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
            const formattedData = result.map((entry) => {
                return { time: entry.time, value: entry.value };
              });
        
            return res.status(200).json({
                results: formattedData 
            });
        }
    })
})

// router.get('/OpenData', async (req, res) => {
//     const { sensorType, location, date } = req.body;
  
//     // Get user ID based on location
//     const userIdQuery = `
//       SELECT userID
//       FROM user
//       WHERE location = ?
//     `;
  
//     con.query(userIdQuery, [location], (err, userIdResult) => {
//       if (err) {
//         console.error('MySQL query error:', err);
//         return res.status(500).json({ error: 'Internal Server Error', details: err.message });
//       }
  
//       if (userIdResult.length === 0) {
//         return res.status(404).json({ error: 'User not found for the specified location' });
//       }
  
//       const userId = userIdResult[0].userID;
  
//       const sensorDataQuery = `
//         SELECT data_collection.value, data_collection.date, data_collection.time
//         FROM data_collection
//         JOIN interests ON data_collection.interestID = interests.interestID
//         JOIN sensors ON interests.sensorID = sensors.sensorsID
//         WHERE sensors.sensorType = ? AND interests.userID = ? AND data_collection.date = ?
//         ORDER BY data_collection.time
//       `;
  
//       con.query(sensorDataQuery, [sensorType, userId, date], (err, sensorData) => {
//         if (err) {
//           console.error('MySQL query error:', err);
//           return res.status(500).json({ error: 'Internal Server Error', details: err.message });
//         }
  
//         const formattedData = sensorData.map((entry) => {
//           return { date: entry.date, time: entry.time, value: entry.value };
//         });
  
//         res.json({ results: formattedData });
//       });
//     });
//   })

 return router;
}


module.exports = user;