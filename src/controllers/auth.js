import User from '../models/User.js';
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'my_jwt_secret'; // Use env in production

export const register = async (req, res) => {
    try{
        const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({$or:[{email}, {username}]});
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    // Hash the password before saving it in db. Function in user model.
    //const hashedPassword = await bcrypt.hash(password, 10);

    //Get avatar for profilepic
    const profileImage = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${username}`;

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      profileImage,
    });

    await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '15d' }
        );

        // Respond with token and user info (excluding password)
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profileImage: newUser.profileImage,
                createdAt: newUser.createdAt,
            },
        });

    }catch(err){
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
    
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
    
        // Validate input
        if (!email || !password) {
          return res.status(400).json({ message: 'Email and password are required' });
        }
    
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
    
        // Compare passwords
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
    
        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          JWT_SECRET,
          { expiresIn: '15d' }
        );
    
        // Respond with token and user info
        res.status(200).json({
          message: 'Login successful',
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            createdAt: user.createdAt,
          },
        });
      } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
      }
}

export const logout = async (req, res) => {
    
}