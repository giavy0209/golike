const express= require('express');
const app = express();
const port = 3001;
const server = require("http").Server(app);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
server.listen(port);
const io = require("socket.io")(server);
const mongoose = require('mongoose');
mongoose.connect('mongodb://admin:Phamgiavyvn123@207.148.67.200:27017/golike?authSource=admin',{ useNewUrlParser: true ,useUnifiedTopology: true,useFindAndModify: false});
const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    userGolike: String,
    passGolike:String,
});

const userInfos = mongoose.model('userInfos', userSchema);

const fbAccountSchema = new mongoose.Schema({
    username:String,
    password:String,
    id:String,
    owner:String,
});

const fbAccountInfos = mongoose.model('fbAccountInfos', fbAccountSchema);


const updateOption = {upsert: true, new: true, runValidators: true}
io.on('connection',(socket)=>{
    socket.on('client-reg', async data=>{
        try{
            var {username, password} = data;
            var user = await userInfos.findOne({username})
            if(user) socket.emit('reg-fail')
            else{
                var d = new Date().toISOString().substring(0,19).replace("T"," ")
                await userInfos.create({
                    username,
                    password,
                    userGolike:'',
                    passGolike:'',
                })
                socket.emit('reg-success')
            }
        }catch{socket.emit('undefind')}
    })
    socket.on('client-login', async data=>{
        try {
            var {username, password} = data;
            var queryUser ={username,password}
            var user = await userInfos.findOne(queryUser)
            if(user){
                socket.emit('login-success',user)
            }else socket.emit('login-fail') 
        } catch {socket.emit('undefind')}
    })

    socket.on('client-edit-golike-account', async ({Username,Password,UserGolike,PassGolike})=>{
        try{
            await userInfos.findOneAndUpdate({username:Username,password:Password},{userGolike:UserGolike,passGolike:PassGolike},updateOption)
            socket.emit('edit-golike-account-success')
        }catch{

        }
    })

    socket.on('add-accoung-fb',({username,password,id,owner})=>{
        fbAccountInfos.create({
            username,
            password,
            id,
            owner,
        })
    })
})