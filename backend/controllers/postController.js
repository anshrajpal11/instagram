import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";


export const createPost = async(req,res)=>{
  const {caption} = req.body;
  const image = req.file;
  const authorId = req.id;
  if(!image){
    return res.status(401).json({
      message:"image required"
    })
  } 

  const optimizedImageBuffer = await sharp(image.buffer).resize({width:800,height:800,fit:'inside'}).toFormat("jpeg",{quality:80}).toBuffer();

  const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

  const cloudResponse = await cloudinary.uploader.upload(fileUri);



  const user= await User.findById(authorId);
  const post = await Post.create({
    caption,
    author:authorId,
    image:cloudResponse.secure_url
  })

  user.posts.push(post._id);

  await post.populate({path:'author',select:'-password'});

  await user.save();

  return res.json({
    message:"new post added",
    post,
    success:true,
  })
}

export const getAllPost = async(req,res)=>{
  try {
   const posts = await Post.find()
  .sort({ createdAt: -1 })
  .populate({ path: "author", select: "username profilePicture" })
  .populate({
    path: "comments",
    options: { sort: { createdAt: -1 } },
    populate: {
      path: "author",
      select: "username profilePicture",
    },
  });


    return res.json({
      posts,
      success:true
    })


  } catch (error) {
    console.log(error);
  }
}



export const getUserPost=async(req,res)=>{
  try {
    const userId = req.id;
    const posts = await Post.find({author:userId}).sort({createdAt:-1}).populate({path:'author',select:'username,profilePicture'}).populate({
    path: "comments",
    options: { sort: { createdAt: -1 } },
    populate: {
      path: "author",
      select: "username profilePicture",
    },
  });

    return res.json({
      posts,
      success:true
    })

  } catch (error) {
    console.log(error);
  }
}

    











