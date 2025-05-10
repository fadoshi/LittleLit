import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async(req, res, next) => {
    try{
        //Get token
        const token  = req.header("Authorization").replace("Bearer ", "");
        if(!token) return res.status(401).json({ message: "No auth token, access denied" });
        
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Find user from the db
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) return res.status(401).json({ message: "Token is not valid" });

        req.user = user;
        next();

    } catch(err) {
        console.log("Authentication error:", err.message);
        res.status(401).json({ message: "Token is not valid"})
    }
};

export default protectedRoute;
