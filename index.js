const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const jwt_secret  = "todoapplication";
app.use(express.json());
const users = []

function logger(req, res, next) {
    console.log(req.method + "request came");
    next();
}
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/public/index.html");
});

app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if(users.find(user => user.username === username)){
        res.json({
            message: "Username already exists"
        })
    }
    else if(username.length < 5){
        res.json({
            message : "Short Username"
        })
    }
    else{
        users.push({
            username : username,
            password : password
        });
        
        res.json({
            message : "Signed up sucessfully"
        })
    }
});

app.post("/Signin",(req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    const validuser = users.find(user=>user.username === username && user.password === password)
    if(validuser){
        const token = jwt.sign({username},jwt_secret);
        res.header("jwt",token);
        res.json({
            message : "User signed in successfully",
            token : token
        })
        
    }else{
        res.status(403).json({
            message : "Invalid username or password"
        })
    }
});

function authmiddleware(req,res,next){
    const token = req.headers.token;
    if(!token){
        return res.status(403).json({
            message : "Sign in Required"
        });
    }else{
        try{
            const decodedtoken = jwt.verify(token,jwt_secret);
            req.username = decodedtoken.username;
            next();
        }catch(err){
            return res.status(403).json({
                message : "Invalid Token"
            });
        }
    }
}
app.use(authmiddleware);

app.get("/me",logger ,  (req, res) => {
    const username = req.username;
    const validuser = users.find(user => user.username === username);

    if(validuser){
        res.json({
            username: validuser.username,
            password: validuser.password
        });
    } else {
        res.status(404).json({
            message: "User not found"
        });
    }

});
        
        
        
app.listen(3000);
        