import express from 'express';
import Discussion from '../models/discussionSchema.js';
import verifyToken from '../middleWare/authenticate.js';
import { upload } from '../utils/multerConfig.js';
import slugify  from '../utils/slugify.js';

const discussionRoutes = express.Router();

discussionRoutes.use(verifyToken);

discussionRoutes.put('/:discussionId', upload.fields([
  { name: 'description', maxCount: 1, optional: true }
]), async (req, res) => {

  if(!req.body.club || !req.body.title || !req.body.participants || !req.body.moderator || !req.body.scheduleDate || !req.body.duration) {
    return res.status(400).json({
      success: false,
      message: 'parameters are missing'
    }); 
  }

  try {
    const slug = await slugify(req.body.title, Discussion);
    
    // Build update object
    const updateData = {
      slug: slug,
      title: req.body.title,
      participants: JSON.parse(req.body.participants),
      moderator: req.body.moderator,
      scheduleDate: req.body.scheduleDate,
      duration: req.body.duration,
      reactions: req.body.reactions,
      comments: req.body.comments,
      votes: req.body.votes,
      createdBy: req.user.userId,
      updatedAt: new Date(),
      club: req.body.club
    };

    // Only update description if file is uploaded
    if (req.files && req.files.description && req.files.description[0]) {
      updateData.description = req.files.description[0].path.replace('public/', '');
    }
    else{
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.description = req.body.descriptionUrl.replace(baseUrl, '');
    }

    const discussion = await Discussion.findByIdAndUpdate(
      req.params.discussionId, 
      updateData,
      { new: true }
    );

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Discussion updated.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating discussion',
      error: error.message
    });
  }
});

discussionRoutes.post('/create', upload.fields([
  { name: 'description', maxCount: 1, optional: false }
]), async (req, res) => {


  if(!req.body.title || !req.body.participants || !req.body.moderator || !req.body.scheduleDate || !req.body.duration) {
    return res.status(400).json({
      success: false,
      message: 'parameters are missing'
    }); 
  }

  try {
    const slug = await slugify(req.body.title, Discussion);
    const discussion = await Discussion.create({
      slug: slug,
      title: req.body.title,
      description: req.files.description[0].path.replace('public/', ''),
      participants: JSON.parse(req.body.participants),
      moderator: req.body.moderator,
      scheduleDate: req.body.scheduleDate,
      duration: req.body.duration,
      reactions: req.body.reactions,
      comments: req.body.comments,
      votes: req.body.votes,
      createdBy: req.user.userId
    });
    res.status(200).json({
      success: true,
      message: 'Discussion created successfully',
      discussion: discussion._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating discussion',
      error: error.message
    });
  }
});

discussionRoutes.get('/:discussionId', async (req, res) => {
  try {
    const discussion = await Discussion.findOne({ _id: req.params.discussionId })
      .populate('participants', '_id fullName username profileImage')
      .populate('moderator', '_id fullName username profileImage')
      .populate('createdBy', '_id fullName username profileImage');
      // .populate('club', '_id name slug');

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    discussion.description = baseUrl + '/' + (discussion.description || '');
    res.status(200).json({
      success: true,
      discussion
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discussion',
      error: error.message
    });
  }
});

discussionRoutes.get('/manage/all', async (req, res) => {
  
  try {
    // Parse pagination and sorting parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Parse sorting parameter (format: "field:order")
    let sort = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(':');
      sort[field] = order === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 }; // Default sort by createdAt descending
    }

    // Build the query
    const query = {
      $or: [
        { createdBy: req.user.userId },
        { participants: { $in: [req.user.userId] } },
        { moderator: req.user.userId }
      ]
    };

    // Get total count for pagination
    const totalDiscussions = await Discussion.countDocuments(query);
    const totalPages = Math.ceil(totalDiscussions / limit);

    const discussions = await Discussion.find(query)
      .populate('participants', '_id fullName username profileImage')
      .populate('moderator', '_id fullName username profileImage')
      .populate('createdBy', '_id fullName username profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      discussions,
      pagination: {
        currentPage: page,
        totalPages,
        totalDiscussions,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      user:req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching discussions',
      error: error.message
    });
  }
});



export default discussionRoutes;
