import express from 'express';
import * as jose from 'jose';  // Replace jwt with jose
import User from '../models/userSchema.js';  
import Preference from '../models/preferenceSchema.js';
import dotenv from 'dotenv';
import crypto from 'crypto';  // Add this import (built into Node.js)
dotenv.config();

const accountRoutes = express.Router();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);  // Convert to Uint8Array

// Helper function to hash password
const hashPassword = (password) => {
  return crypto.createHash('md5').update(password).digest('hex');
};

// Helper function to create JWT
const createToken = async (payload) => {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
};

// Route to insert data
accountRoutes.post('/', async (req, res) => {
  try {
    const userData = req.body;
    userData.password = hashPassword(userData.password);
    const existingUser = await User.findOne({ 
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      return res.status(200).json({
        success: false,
        message: 'User already exists',
        field: existingUser.username === userData.username ? 'username' : 'email',
        error: existingUser.username === userData.username ? 
          'Username is already taken' : 
          'Email is already registered'
      });
    }

    userData.updated_at = new Date();
    const user = new User(userData);
    const savedUser = await user.save();
    
    const token = await createToken({ 
      userId: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email
    });
    res.cookie('T5authToken', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(201).json({ 
      success: true,
      message: 'User created successfully', 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user, please try again later', error: error.message });
  }
});

accountRoutes.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    const user = await User.findOne({ 
      email: email, 
      password: hashedPassword 
    });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password', error: 'Invalid email or password' });
    }
    const token = await createToken({ 
      userId: user._id.toString(),
      username: user.username,
      email: user.email
    });
    res.cookie('T5authToken', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(200).json({ success: true, message: 'Login successful'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in, please try again later', error: error.message });
  }
});


export default accountRoutes;  