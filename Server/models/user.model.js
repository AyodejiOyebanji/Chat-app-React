const mongoose =require("mongoose");
const bcrypt = require("bcryptjs")
const userSchema=mongoose.Schema({
    email:{type:String,required:true,unique:true},
    fName:{type:String,required:true},
    profilePics:{type:String},
    userName:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    followers:Array,
    following:Array,
    birthday:{},
    post: Array,
    confirmCode:{type:Number,required:true}


},
{
    timestamps:true,
}
)

const saltRound=10
userSchema.pre("save", function(next) {
    bcrypt.hash(this.password,saltRound,(err,hashedPassword)=>{
        if(err){
            console.log(err);
        }else{
            this.password=hashedPassword
            next()
        }

    })

    
})
userSchema.methods.validatePassword=function(password,callback){

bcrypt.compare(password,this.password,(err,same)=>{
    if(!err){
       callback(err,same)
        
    }else{
      next()
        
    }

})


}

// function fetchData(callback){
//     let userData=userTable.find({});
//     userData.exec(function(err,data){
//             if(err){
//                 console.log(err);
                
//             }else{
//                 console.log(data);
                
//             }
//     })
// }


const userModel= mongoose.model("instaUserDetails_tb",userSchema );
module.exports=userModel