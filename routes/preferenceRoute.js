import express from 'express';
  
import Preference from '../models/preferenceSchema.js';
import verifyToken from '../middleWare/authenticate.js';

const preferenceRoutes = express.Router();

preferenceRoutes.use(verifyToken);

preferenceRoutes.post('/', async (req, res) => {
  try {
    const { languages, interestingAreas } = req.body;
    const preference = await Preference.findOneAndUpdate(
      { userId: req.user.userId },
      { languages, interestingAreas },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Preference saved successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving preference',
      error: error.message 
    });
  }
});

preferenceRoutes.get('/', async (req, res) => {
  const preferences = await Preference.findOne({ userId: req.user.userId });
  res.status(200).json({ success: true, preference: preferences });
});

export default preferenceRoutes;