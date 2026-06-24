import userModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import blacklistModel from '../models/blacklist.model.js';
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

        res.cookie('token', token)

        res.status(201).json({message: "User registered successfully", user: {name,email}});
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
        res.cookie('token', token)
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

        res.clearCookie("token")

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
