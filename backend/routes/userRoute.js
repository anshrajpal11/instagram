import express from "express";
import { editProfile, followUnfollow, getProfile, getSuggestedUsers, login, logout, register } from "../controllers/userController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",logout);
router.get("/profile/:id",isAuthenticated,getProfile);
router.post("/profile/edit",isAuthenticated,upload.single('profilePicture'),editProfile);
router.get("/suggested",getSuggestedUsers);
router.post("/followUnfollow/:id",isAuthenticated,followUnfollow);


export default router;
