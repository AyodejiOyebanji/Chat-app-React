const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json());
const mongoose = require('mongoose');
require('dotenv').config();
app.set('view engine', 'ejs');

const URI = process.env.MONGO_URL;
const PORT = process.env.PORT || 6000;
const socket =require("socket.io")
app.set('*', 'cors');
const userRouter = require('./routers/user.route.js');

app.use('/users', userRouter);


mongoose.connect(URI, (err) => {
  if (err) {
    console.log('Mongodb not connecting');
    console.log(err);
  } else {
    console.log('Mongoose connecting');
  }
});

const server=app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
const io =socket(server,{
  cors:{
    origin:"http://localhost:3000",
    credentials:true,
  }
})
global.onlineUsers= new Map();
io.on("connection",(socket)=>{
  global.chatSocket=socket;
  socket.on("add-user",(userId)=>{
    onlineUsers.set(userId,socket.id);
  })
  socket.on("send-message",(data)=>{

    const sendUserSocket=onlineUsers.get(data.to);
    if(sendUserSocket){
      socket.to(sendUserSocket).emit("message-receive",data.message)
    }
  })
})
