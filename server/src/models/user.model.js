import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        unique: [true, "Email already exists"]
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false
    },
},{timestamps: true});

const userModel = mongoose.model('User', userSchema);
export default userModel;