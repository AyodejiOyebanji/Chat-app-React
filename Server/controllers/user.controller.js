const userModel = require('../models/user.model');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cloudinary = require('cloudinary');
const jwt = require('jsonwebtoken');
const postModel = require('../models/post.model');
const { findOneAndUpdate } = require('../models/user.model');
const messageModel = require('../models/message.model');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const getLanding = (req, res) => {
  res.send('it work');
};
const registerUser = (req, res) => {
  let userDetails = req.body;
  userModel
    .findOne({
      $or: [
        {
          email: req.body.email,
        },
        {
          userName: req.body.userName,
        },
      ],
    })
    .then((user) => {
      if (user) {
        if (user.userName === req.body.userName) {
          res.send({ message: 'User Name already exists', status: false });
        } else {
          res.send({
            message: 'Email or Phonenumber already exists',
            status: false,
          });
        }
      } else {
        let form = new userModel(req.body);
        form.save((err) => {
          if (err) {
            res
              .status(501)
              .send({ message: 'Could not sign up, try again', status: false });
          } else {
            res.send({ message: 'Registration Successful', status: true });
          }
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: 'Internal Server Error', status: false });
    });
};
const getDob = (req, res) => {
  let userMeans = req.params.currentUser;
  userModel.findOneAndUpdate(
    { email: req.params.currentUser },
    { birthday: req.body },
    (err) => {
      if (err) {
        res
          .status(500)
          .send({ message: 'Internal server Error', status: false });
      } else {
        res.send({ message: 'Saved', status: true });
        getMail(userMeans);
      }
    }
  );
};

const getMail = (userMeans) => {
  userModel.findOne({ email: userMeans }, (err, user) => {
    if (err) {
      res.status(500).send({ message: 'Internal server Error', status: false });
      
    } else {
      let mailTransporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
          user: process.env.GMAIL_ACCOUNT,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      let details = {
        from: process.env.GMAIL_ACCOUNT,
        to: userMeans,
        subject: "Welcome to Ay' Instagram clone, nice to have you here!!",
        text: `<h4>Hi ${user.userName}</h4>
    <p>Welcome to Our instagram clone, we are glad you are here to enjoy our platform. </p>
    <h1>${user.confirmCode} </h1>
    <p>Enter this code to complete your regitration with us</p>
    <p>Thanks </p>
    `,
      };
      mailTransporter.sendMail(details, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('sent');
        }
      });
    }
  });
};

const getConfirmEmail = (req, res) => {
  userModel.findOne({ email: req.params.currentUser }, (err, user) => {
    if (err) {
      res.status(500).send({ message: 'Internal server Error', status: false });
    } else {
      if (req.body.confirmCode != user.confirmCode) {
        res.send({ message: 'Invalid Code', status: false });
      } else {
        res.send({ message: 'Valid Code', status: true });
      }
    }
  });
};
const getUploadImage = (req, res) => {
  let profilePicture = req.body.profilePics;
  cloudinary.v2.uploader.upload(profilePicture, (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Internal server Error', status: false });
    } else {
      userModel.findOneAndUpdate(
        { email: req.params.currentUser },
        { profilePics: result.secure_url },
        (err) => {
          if (err) {
            res
              .status(500)
              .send({ message: 'Internal server Error', status: false });
          } else {
            res.send({ message: 'Profile Updated Successfully', status: true });
          }
        }
      );
    }
  });
};
const getUploadImageSkip = (req, res) => {
  userModel.findOneAndUpdate(
    { email: req.params.currentUser },
    { profilePics: req.body.profilePics },
    (err) => {
      if (err) {
        res
          .status(500)
          .send({ message: 'Internal server Error', status: false });
      } else {
        res.send({ message: 'Profile Updated Successfully', status: true });
      }
    }
  );
};

// const getAllUSer=(req,res)=>{
//     userModel.find((err,result)=>{
//         if(err){
//             console.log("could not fetch data");
//         }else{
//             console.log(result);
//             res.send(result)
//         }
//     })

// }

const login = (req, res) => {
  const userDetails = req.body;
  userModel.findOne({ email: userDetails.email }, (err, user) => {
    if (err) {
      res.status(500).send({ message: 'Internal Server Error', status: false });
    } else {
      if (!user) {
        res.send({ message: 'Email does not exist', status: false });
      } else {
        user.validatePassword(userDetails.password, (err, same) => {
          if (err) {
            res
              .status(500)
              .send({ message: 'Internal Server Error', status: false });
          } else {
            if (!same) {
              res.send({ message: 'Wrong  email or password ', status: false });
            } else {
              const email = userDetails.email;
              const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: '2h',
              });
              res.send({
                message: 'Welcome Back to Insta ',
                status: true,
                token,
              });
            }
          }
        });
      }
    }
  });
};
const getHome = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
    if (err) {
      res.send({ message: 'Time session out', err, status: false });
    } else {
      const email = result.email;
      userModel.findOne({ email: email }, (err, result) => {
        res.send({ message: 'congratulations', status: true, result });
      });
    }
  });
};
const getPost = (req, res) => {
  if (req.body.postImage) {
    cloudinary.v2.uploader.upload(req.body.postImage, (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Unable to Post', status: false });
      } else {
        let postDetails = { ...req.body, postImage: result.secure_url };
        userModel.findByIdAndUpdate(
          { _id: `${req.params._id}` },
          { $push: { post: postDetails } },
          (err, result) => {
            if (err) {
              res.status(500).send({
                message: 'An error occured, please try again!',
                status: false,
              });
            } else {
              res.send({
                message: 'Post Updated successfully',
                status: true,
                result,
              });
            }
          }
        );
        let form = new postModel(postDetails);
        form.save((err) => {
          if (err) {
            res.status(500).send({ message: 'Unable to Post', status: false });
          }
        });
      }
    });
  } else {
    let postDetails = { ...req.body, postImage: '' };
    userModel.findByIdAndUpdate(
      { _id: `${req.params._id}` },
      { $push: { post: postDetails } },
      (err, result) => {
        if (err) {
          res.status(500).send({
            message: 'An error occured, please try again!',
            status: false,
          });
        } else {
          res.send({
            message: 'Post Updated successfully',
            status: true,
            result,
          });
        }
      }
    );
    let form = new postModel(postDetails);
    form.save((err) => {
      if (err) {
        res.status(500).send({ message: 'Unable to Post', status: false });
      }
    });
  }
};
const getAllPost = (req, res) => {
  postModel.find((err, result) => {
    if (err) {
      res
        .status(500)
        .send({ message: 'Unable to fetch your Newsfeed', status: false });
    } else {
      res.send({ status: true, result });
    }
  });
};
const getLike = (req, res) => {
      postModel.findByIdAndUpdate({_id:req.body.postId},{$push:{likes:req.body.userLikeDetails}},(err,result)=>{
        if(err){
       
          res.status(500).send({ message: 'Unable to like', status: false });
        }else{
         res.send({status:true
        })
  
        }
      })
};
const getUnLike = (req, res) => {
  
      
  postModel.findByIdAndUpdate({_id:req.body.postId},{$pull:{likes:req.body.userLikeDetails}},(err,result)=>{
    if(err){
      
   
      res.status(500).send({ message: 'Unable to unlike', status: false });
    }else{
     res.send({status:true
    })

    }
  })
};
const getComment = (req, res) => {

  postModel.findByIdAndUpdate(
    req.params.postIndex,
    { $push: { comment: req.body } },
    (err, result) => {
      if (err) {
        res
          .status(500)
          .send({ message: 'Unable to upload your commnet', status: false });
      } else {
        res.send({
          message: 'Comment Updated successfully',
          status: true,
          result,
        });
      }
    }
  );
};
const getAllUser = (req, res) => {
 
  
  userModel.find({}, (err, result) => {
    if (err) {
    
    } else {
      const users = result.filter((user)=>user._id!=req.params.currentUser_id)
      
      res.send({ status: true, users });
    }
  });
};
const getFollow = (req, res) => {
  // To follow a user //following
  // for following
  let _id_following = req.body.user._id;
  let userName_following = req.body.user.userName;
  let fName_following = req.body.user.fName;
  let email_following = req.body.user.email;
  let followingDetails = {
    userName_following,
    fName_following,
    email_following,
    _id_following,
  };
  //for follower
  let _id_follower = req.body.currentUser._id;
  let userName_follower = req.body.currentUser.userName;
  let fName_follower = req.body.currentUser.fName;
  let email_follower = req.body.currentUser.email;
  let followerDetail = {
    _id_follower,
    userName_follower,
    fName_follower,
    email_follower,
  };

  //following function starts here
  userModel.findOneAndUpdate(
    { _id: req.params.currentUser_id },
    { $push: { following: followingDetails } },
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Unable to follow', status: false });
      } else {
        userModel
          .findOneAndUpdate(
            { _id: req.body.user._id },
            { $push: { followers: followerDetail } }
          )
          .then((result) => {
            res.send({ message: 'Following', status: true, result });
          });
      }
    }
  );
};

const getUnfollow = (req, res) => {
  // To unfollow a user //following
  // for unfollowing
  let _id_following = req.body.user._id;
  let userName_following = req.body.user.userName;
  let fName_following = req.body.user.fName;
  let email_following = req.body.user.email;
  let followingDetails = {
    userName_following,
    fName_following,
    email_following,
    _id_following,
  };
  //for follower
  let _id_follower = req.body.currentUser._id;
  let userName_follower = req.body.currentUser.userName;
  let fName_follower = req.body.currentUser.fName;
  let email_follower = req.body.currentUser.email;
  let followerDetail = {
    _id_follower,
    userName_follower,
    fName_follower,
    email_follower,
  };

  //unfollow function starts here
  userModel.findOneAndUpdate(
    { _id: req.params.currentUser_id },
    { $pull: { following: followingDetails } },
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Unable to follow', status: false });
      } else {
        userModel
          .findOneAndUpdate(
            { _id: req.body.user._id },
            { $pull: { followers: followerDetail } }
          )
          .then((result) => {
            res.send({ message: 'Unfollowed', status: true, result });
          });
      }
    }
  );
};

const getSendMessage=(req,res)=>{

  
  const {from ,to,message}= req.body

  
  messageModel.create({
      message:{text:message},
      users:[from,to],
      sender:from
  },(err,result)=>{
      if(err){
        res.status(500).send({message:"Could not send your message",status:false})
        
      }else{
           
          res.send({message:"Sent",status:true,})
        
          
      }
  })




}
const getAllMessages=async (req,res,next)=>{

  
  try{
     const {from,to} =req.body
     const messages=await messageModel.find({
       users:{
         $all:[from,to],
       },

     }).sort({updatedAt:1});
   const projectMessages=messages.map((msg)=>{
     return {
       fromSelf:msg.sender.toString()=== from,
       message: msg.message.text ,

       
     }
   });  

   
   
 

   
   
   res.json(projectMessages)
  }catch(ex){
    next(ex)

  }
  

 
//  const projectMessages=messages.map((msg)=>{
//    return{
//      fromSelf: msg.sender.toString()=== from,
//      message:msg.message.text,
//    }
//   })
//   res.send({projectMessages, status:true})

}


module.exports = {
  registerUser,
  login,
  getLanding,
  getDob,
  getMail,
  getConfirmEmail,
  getUploadImage,
  getUploadImageSkip,
  getHome,
  getPost,
  getAllPost,
  getLike,
  getUnLike,
  getComment,
  getAllUser,
  getFollow,
  getUnfollow,
  getSendMessage,
  getAllMessages
};
