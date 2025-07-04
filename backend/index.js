import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDb from './utils/db.js';
import dotenv from 'dotenv';
import userRoute from "./routes/userRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT;


app.use(express.json());
app.use(cookieParser());
app.use(cors()); 

connectDb();

app.use("/api/user",userRoute);

app.get("/",(req,res)=>{
  res.json({
    message:"hello"
  })
})

app.listen(port,()=>{
  console.log(`Server is running on port ${port}`);
})
