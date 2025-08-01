import express from "express";
import Preference from "../models/preferenceSchema.js";
import verifyToken from "../middleWare/authenticate.js";
import Club from "../models/clubSchema.js";
import User from "../models/userSchema.js";
import Discussion from "../models/discussionSchema.js";

const feedRoutes = express.Router();

feedRoutes.use(verifyToken);

feedRoutes.get("/all", async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // get clubs where the user is a follower or as contributor or as creator
    // then get discussions where the club is the club of the discussion
    const user = await User.findOne({
      _id: req.user.userId,
      deleteFlag: false,
    },{asFollower: true, asContributor: true, asCreator: true});
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Extract all club IDs from user's associations
    const clubIds = [
      ...(user.asFollower || []),
      ...(user.asContributor || []),
      ...(user.asCreator || [])
    ];

    console.log("Club IDs:", clubIds);
    
    // Get total count for pagination
    const totalDiscussions = await Discussion.countDocuments({
      club: { $in: clubIds },
      deleteFlag: false,
    });

    let discussions = await Discussion.find({
      club: { $in: clubIds },
      deleteFlag: false,
    })
      .populate("club", "_id name slug")
      .populate("createdBy", "_id fullName username profileImage")
      .populate("participants", "_id fullName username profileImage")
      .populate("moderator", "_id fullName username profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    discussions = discussions.map(discussion => {
      const discussionObj = discussion.toObject();
      return {
        ...discussionObj,
        description: baseUrl + '/' + discussionObj.description
      }
    });
      
    // Calculate pagination details
    const totalPages = Math.ceil(totalDiscussions / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      discussionsFound: discussions.length > 0 ? true : false,
      discussions,
      pagination: {
        currentPage: page,
        totalPages,
        totalDiscussions,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    });

    // const preferences = await Preference.findOne({ userId: req.user.userId });
    // if (!preferences) {
    //   return res.status(200).json({ success: false, preferencesFound: false, message: 'Preferences not found' });
    // }

    // res.status(200).json({
    //   success: true,
    //   preferencesFound: true,
    //   preferences
    // });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error fetching preferences",
      error: error.message,
    });
  }
});

export default feedRoutes;
