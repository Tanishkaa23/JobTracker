import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import blacklistModel from '../models/blacklist.model.js';
export async function authMiddleware(req, res, next){
   try{

    console.log("===== AUTH MIDDLEWARE =====");
    console.log("Path:", req.path);
    console.log("Origin:", req.headers.origin);
    console.log("Cookies:", req.cookies);
    console.log("Cookie header:", req.headers.cookie);
    console.log("Authorization:", req.headers.authorization);

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    const blackListed = await blacklistModel.findOne({token})
    
    if(blackListed){
        return res.status(401).json({message:"Token has been invalidated"})
    }

    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id); // find the user in the database using the decoded id from the token
    if(!user){
        return res.status(401).json({message: "Unauthorized"});
    }

    req.user = user; //store the decoded user information in the request object for further use
    
    //call the next middleware or route handler
    next();

   }catch(err){
        return res.status(401).json({message: "Invalid token"});
   }
}
