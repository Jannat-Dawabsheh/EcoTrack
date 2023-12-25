var express = require("express")
var app = express()
const PORT = 3333 || process.env.PORT ;
const appUserRouters = require('./user_router.js')
const appReportRouters = require('./report_router.js')
app.use(express.json());

app.use('/api', appUserRouters)
app.use('/api', appReportRouters)

app.listen(PORT,(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("on port "+PORT)
        console.log(`server is running on http://localhost:${PORT}`)
    }
})
