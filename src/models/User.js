import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      profileImage: {
        type: String,
        default:""
      }
    });

    //Hash password before saving user to db
    userSchema.pre("save", async function(next){
        if(!this.isModified("password")) return next();
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    });

    //Compare password fuc
    userSchema.methods.comparePassword = async function(userPassword) {
        return await bcrypt.compare(userPassword, this.password);
    };
    
    // Create the User model
    const User = mongoose.model('User', userSchema);
    
    export default User;