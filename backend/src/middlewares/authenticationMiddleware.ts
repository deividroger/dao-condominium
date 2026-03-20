import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = `${process.env.JWT_SECRET}`;

export default (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            if (decoded) {
                res.locals.token = decoded;
                return next();
            } else {
                console.error('Token verification failed: Decoded token is invalid');
                return res.sendStatus(403); // Forbidden
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.sendStatus(403); // Forbidden
        }
    } else {
        console.log('No token provided');
        return res.sendStatus(401); // Unauthorized
    }
};