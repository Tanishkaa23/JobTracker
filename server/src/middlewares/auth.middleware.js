import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import blacklistModel from '../models/blacklist.model.js';
export async function authMiddleware(req, res, next){
   try{

    console.log("========== AUTH ==========");
    console.log("Path:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("Origin:", req.headers.origin);
    console.log("Cookies:", req.cookies);

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    console.log("Token exists:", !!token);

    if (!token) {
        console.log("NO TOKEN");
        return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    const user = await userModel.findById(decoded.id);

    console.log("User found:", !!user);

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();

   }catch(err){
        return res.status(401).json({message: "Invalid token"});
   }
}
