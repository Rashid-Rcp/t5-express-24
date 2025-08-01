import express from 'express';
import Club from '../models/clubSchema.js';
import User from '../models/userSchema.js';
import Discussion from '../models/discussionSchema.js';
import verifyToken from '../middleWare/authenticate.js';
import { upload } from '../utils/multerConfig.js';
import slugify from '../utils/slugify.js';

const clubRoutes = express.Router();

clubRoutes.use(verifyToken);

clubRoutes.post('/create', upload.fields([
  { name: 'profileImage', maxCount: 1, optional: true },
  { name: 'coverImage', maxCount: 1, optional: true }
]), async (req, res) => {

  console.log(req.body);

  try {
    // Check if club name already exists
    const existingClub = await Club.exists({ name: req.body.name });
    if (existingClub) {
      return res.status(200).json({
        success: false, 
        clubExist: true,
        message: 'Club name already exists'
      });
    }
    const slug = await slugify(req.body.name, Club);
    const club = await Club.create({
      slug: slug,
      name: req.body.name,
      tagline: req.body.tagline,
      about: req.body.about,
      profileImage: req.files?.['profileImage']?.[0]?.path?.replace('public/', '') || null,
      coverImage: req.files?.['coverImage']?.[0]?.path?.replace('public/', '') || null,
      user: req.user.userId,
      isPrivate: req.body.isPrivate,
      languages: req.body.languages,
      intrest: req.body.interestingAreas,
      contributors: req.body.contributors 
    });
    await User.findByIdAndUpdate(req.user.userId, { $push: { asCreator: club._id } });
    for (const contributor of req.body.contributors) {
      await User.findByIdAndUpdate(contributor, { $push: { asContributor: club._id } });
    }

    res.status(200).json({
      success: true,
      message: 'Club created successfully',
      club: club._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating club',
      error: error.message
    });
  }
});

clubRoutes.get('/get/:name', async (req, res) => {
  try {
    const club = await Club.findOne({ slug: req.params.name.toLowerCase() })
      .populate('contributors', '_id fullName username profileImage');
    
    res.status(200).json({
      success: true,
      club
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching club',
      error: error.message
    });
  }
});

clubRoutes.get('/feed/all', async (req, res) => {
  try {
    const feeds = await Discussion.find({}).populate('createdBy', '_id fullName username profileImage')
    // .populate('club', '_id name slug')
    .populate('participants', '_id fullName username profileImage')
    .populate('moderator', '_id fullName username profileImage')
    .populate('acceptedBy', '_id fullName username profileImage')
    .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      feeds
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching club feed',
      error: error.message
    });
  }
});

export default clubRoutes;
