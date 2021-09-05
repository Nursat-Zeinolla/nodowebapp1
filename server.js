const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {ObjectId} = require("mongodb");
const { Schema } = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{ 
        type: String,
    },
    tasks: []
});
const taskSchema = new mongoose.Schema({
    id: {type: String},
    tasks: [{time: String, task: String}]
})

const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

const uri = 'mongodb+srv://admin:admin123@cluster0.29ra0.mongodb.net/MySchedule?retryWrites=true&w=majority';
mongoose.connect(uri,
    { 
        useUnifiedTopology: true, 
        useNewUrlParser: true, 
        useFindAndModify: false 
    });



app.use( bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
const urlencodedParser = bodyParser.urlencoded({extended:false});


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

app.get("/sign_up", (req, res)=> {
    res.sendFile(__dirname + "/sign_up.html");
});

app.get("/sign_in", (req, res) => {
    res.sendFile(__dirname + "/sign_in.html");
});
app.get("/notfound", (req, res) =>{
    res.sendFile(__dirname + "/notfound.html");
});
app.get("/incorrectpassword", (req, res) => {
    res.sendFile(__dirname + "/incorrectpassword.html");
})

let id;
let username;
app.post("/api/users/sign_up", urlencodedParser, (req, res) => {
    res.setHeader('content-type', 'application/json');
    if(!req.body) return res.sendStatus(400);
    
    const {name, email, password} = req.body;
    const newUser = new User();

    newUser.name = name;
    newUser.email = email;
    newUser.password = password;

    newUser.save()

    id = newUser._id;
    username = newUser.name
    console.log(newUser._id);
    res.redirect(`/user?id=${id}&username=${username}`);
});
app.get('/user', (req, res) =>{
    
    User.findOne({_id: req.query.id}, function(err, doc){
       
       let array = doc.tasks.slice(0);

       res.render("index", {
        username: req.query.username,
        id: req.query.id,
        tasks: array

       });
    }); 
    
});

app.post('/api/users/sign_in', urlencodedParser, (req, res) =>{
    if(!req.body) return res.sendStatus(400);

    User.findOne({email: req.body.email}, function(err, doc){
        //mongoose.disconnect();
        console.log(doc);
        if(doc == null){
            res.redirect("/notfound")
            
        }
        else{
            if(doc.password == req.body.password){
                console.log("Password is correct");
                res.redirect(`/user?id=${doc._id}&username=${doc.name}`);
            }
            else{
                res.redirect("/incorrectpassword")
            }
        }
        
    })
    
});
app.post('/api/user/tasks', urlencodedParser, (req, res) =>{
    if(!req.body) return res.sendStatus(400);

    let username = req.body.name;
    let id = req.body.id;
    let time = req.body.timeInput;
    let task = req.body.taskInput;

   User.findOne({_id: id}, function(err, doc){

       doc.tasks.push({time: time, task: task});
       
       console.log(username + ' - ' + id);
       console.log(`The task was added: Time:${time} Task:${task}`);
       res.redirect(`/user?id=${id}&username=${username}`);
       
      
       doc.save();
       
       
   });
  
});
app.post('/api/user/tasks/delete', urlencodedParser, (req, res) =>{
    if(!req.body) return sendStatus(400);

    User.findOne({_id: req.query.id}, (err, doc)=>{
        let number = req.query.number;
        let arr = doc.tasks[number];
        User.update({_id: req.query.id}, {$pull: {tasks : arr}}, {multi: true}, (err, data)=>{
            console.log(data);
            res.redirect(`/user?id=${req.query.id}&username=${req.query.username}`);
        })
    })
    
    

   

})
app.listen(3000, function() {
    console.log("Starting server at port 3000...")
});
