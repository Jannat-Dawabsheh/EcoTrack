var express=require("express")
var bodyParser=require('body-parser')
const con=require('./config/config')
var userFile = require("./routes/user")
var educationalFile = require("./routes/educational")
var communication = require("./routes/communication")
var search = require("./routes/search")
var dataAnalysis = require("./routes/dataAnalysis")

var app=express()
app.use(express.json())
app.use(bodyParser.json())

app.listen(3000,(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("listen on port 3000")
    }
})
app.use("/user",userFile(con))
app.use("/educational",educationalFile(con))
app.use("/communication",communication(con))
app.use("/search",search(con))
app.use("/dataAnalysis",dataAnalysis(con))
