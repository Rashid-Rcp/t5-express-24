import { jwtVerify } from 'jose';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.T5authToken; 
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    } 

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};    

export default verifyToken;