var express=require('express')
const CheckAuth=require('../Middleware/check_auth');
const user = (con) => {
const router = express.Router();
// view all Educational Resources
router.get("/",CheckAuth,(req,res)=>{
    
    con.query('select title, URL from educational_resources',(err,result)=>{
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

// search Educational Resource by type
router.get("/:type",CheckAuth,(req,res)=>{
    const type=req.params.type;
    con.query('select title, URL from educational_resources where type=?',type,(err,result)=>{
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