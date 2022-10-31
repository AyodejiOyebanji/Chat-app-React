const express = require("express");
const router= express.Router();
const userController=require("../controllers/user.controller")
router.get("/", userController.getLanding)
router.post("/signup", userController.registerUser)
router.post("/dob/:currentUser", userController.getDob)
router.post("/emailconfirmation/:currentUser",userController.getConfirmEmail)
router.post("/uploadImage/:currentUser",userController.getUploadImage)
router.post("/uploadImageSkip/:currentUser",userController.getUploadImageSkip)
router.post("/login", userController.login)
router.get("/home",userController.getHome)
router.post("/post/:_id", userController.getPost)
router.get("/getAllUser/:currentUser_id", userController.getAllUser)
router.get("/getAllPost", userController.getAllPost)
router.post("/like", userController.getLike)
router.post("/unlike", userController.getUnLike)
router.post("/comment/:postIndex",userController.getComment)
router.post("/follow/:currentUser_id",userController.getFollow)
router.post("/unfollow/:currentUser_id", userController.getUnfollow)
router.post("/addChat", userController.getSendMessage)
router.post("/getAllMessages", userController.getAllMessages)

module.exports=router
