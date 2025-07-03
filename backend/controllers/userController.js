import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "Please enter all fields.",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(401).json({
        message: "User already exixts.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};


export const login = async(req,res)=>{
  const {email,password} = req.body;

  if(!email || !password){
    return res.status(401).json({
        message:"Please enter all details.",
        success:false
    })
  }

  let user = await User.findOne({email});

  if(!user){
    return res.status(401).json({
        message:"User does not exists.",
        success:false
      })
  }

  const isPassMatch = await bcrypt.compare(password,user.password);

  if(!isPassMatch){
    return res.status(401).json({
        message:"Incorrect email or password.",
        success:false
    })
  }

  const token = jwt.sign({userId:user._id},process.env.SECRET_KEY);

  user={
    _id:user._id,
    username:user.username,
    email:user.email,
    profilePicture:user.profilePicture,
    bio:user.bio,
    followers:user.followers,
    following:user.following,
    posts:user.posts
  }

  return res.cookie('token',token,{httpOnly:true,sameSite:'strict'}).json({
    message:`Welcome back ${user.username}`,
    success:true,
    user
  })



}

export const logout = async(req,res)=>{
  try {
    return res.cookie("token","").json({
      message:"logged out successfully",
      success:true
    })
  } catch (error) {
    console.log(error)
  }
}


export const getProfile = async(req,res)=>{
  try {
    const userId = req.params.id;
    let user = await User.findById(userId);
    return res.status(200).json({
      user,
      success:true
    })

  } catch (error) {
    console.log(error);
  }
}

export const editProfile = async(req,res)=>{
  try {
    const userId = req.id;
    const {bio,gender} = req.body;
    const profilePicture = req.files;
    let cloudResponse;
    const user = await user.findById(userId);
    if(profilePicture){
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    if(bio){
      user.bio=bio;
    }
    if(gender){
      user.gender=gender;
    }
    if(profilePicture){
      user.profilePicture = cloudResponse.secure_url;
    }

    await user.save();


  } catch (error) {
    console.log(error);
  }
}


export const getSuggestedUsers = async(req,res)=>{
  try {
    const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password");
    if(!suggestedUsers){
      return res.status(400).json({
        message:"Currently do not have any users"
      })
    }
    return res.status(400).json({
      users:suggestedUsers
    })
  } catch (error) {
    
  } 
}


export const followUnfollow = async (req, res) => {
  try {
    const userId = req.id;
    const othersId = req.params.id;

    if (userId === othersId) {
      return res.status(400).json({ message: "You can't follow/unfollow yourself" });
    }

    const user = await User.findById(userId);
    const otherUser = await User.findById(othersId);

    if (!user || !otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.following.includes(othersId);

    if (isFollowing) {
     
      user.following = user.following.filter(id => id.toString() !== othersId);
      otherUser.followers = otherUser.followers.filter(id => id.toString() !== userId);
    } else {
      
      user.following.push(othersId);
      otherUser.followers.push(userId);
    }

    await user.save();
    await otherUser.save();

    return res.status(200).json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
