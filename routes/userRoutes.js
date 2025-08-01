import express from 'express';
import User from '../models/userSchema.js';
import verifyToken from '../middleWare/authenticate.js';

const userRoutes = express.Router();

userRoutes.use(verifyToken);

userRoutes.get('/head', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('profileImage username');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data',
      error: error.message 
    });
  }
});

userRoutes.get('/all', async (req, res) => {
    try {
        const users = await User.find().select('_id username fullName profileImage');
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

userRoutes.get('/search', async (req, res) => {
    try {
        const userId = req.user.userId;
        const searchQuery = req.query.query;
        let users;
        if (searchQuery) {
            users = await User.find({
                $and: [
                    { _id: { $ne: userId } },
                    {
                        username: { $regex: searchQuery, $options: 'i' } 
                    }
                ]
            }).select('_id username profileImage');
        } else {
            // Get 10 random users if no search query
            // users = await User.aggregate([
            //     { $match: { _id: { $ne: userId } } },
            //     { $sample: { size: 10 } },
            //     { $project: { _id: 1, username: 1, fullName: 1, profileImage: 1 } }
            // ]);
        }
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

userRoutes.get('/clubs', async (req, res) => {
  const role = req.query.role ? req.query.role.split(',') : null;
  
  try {
    if (!role) {
      return res.status(200).json({
        success: false,
        message: 'No role provided',
        clubs: null
      });
    }

    const populateFields = role.map(roleType => {
      switch (roleType) {
        case 'creator':
          return 'asCreator';
        case 'contributor':
          return 'asContributor';
        case 'member':
          return 'asMember';
        default:
          return null;
      }
    }).filter(field => field !== null);

    const populateOptions = populateFields.map(field => ({
      path: field,
      select: '_id name slug isPrivate'
    }));

    const user = await User.findById(req.user.userId)
      .populate(populateOptions);

    const clubs = populateFields.reduce((acc, field) => {
      if (user[field] && user[field].length > 0) {
        acc.push(...user[field]);
      }
      return acc;
    }, []);

    res.status(200).json({
      success: true,
      clubs
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clubs',
      error: error.message
    });
  }
});

export default userRoutes;
