import userModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import blacklistModel from '../models/blacklist.model.js';
import {sendRegEmail} from '../services/email.service.js'
export async function registerUser(req, res) {
    const {name,email,password} = req.body;
    try{
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 8){
            return res.status(400).json({message: "Password must be at least 8 characters long"});
        }
        const hashedPass = await bcrypt.hash(password, 10)

        const user = await userModel.create({name,email,password: hashedPass});

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);

        res.cookie('token', token, {
            httpOnly: true,
           secure: process.env.NODE_ENV === 'production',
           sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({message: "User registered successfully", user: {name,email}});

        await sendRegEmail(user.email, user.name)

    } catch (error) {
        res.status(400).json({message: error.message});
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const user = await userModel
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid login credentials"
            });
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',      // 'lax' is fine for same-site-ish local dev; use 'none' + secure:true in cross-site production
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({message: "Login successful", user: {name: user.name, email: user.email}, token});

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
}

export async function logoutUser(req, res) {
    try{
        const token = req.cookies.token

        if(!token){
            return res.status(400).json({message:"No token found"})
        }

        await blacklistModel.create({token})

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        return res.status(200).json({message:"Logged out successfully"})
    }catch(err){
        return res.status(500).json({message:err.message})
    }
}

export async function userDetails(req, res) {
    try{
        const {name, email} = req.user;

        return res.status(200).json({message: "success", user: {name, email}});

    } catch (error) {
        return res.status(400).json({message: error.message});
    }
}

export async function updateUser(req, res) {
    const { name, email } = req.body;
    try {
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required.' });
        }

        const existingUser = await userModel.findOne({ email, _id: { $ne: req.user._id } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use by another account.' });
        }

        req.user.name = name;
        req.user.email = email;
        await req.user.save();

        return res.status(200).json({ message: 'Profile updated successfully', user: { name: req.user.name, email: req.user.email } });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}
