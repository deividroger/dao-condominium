import {Request, Response, NextFunction} from 'express';
import {LoginData} from 'src/controllers/authController';
import { Profile } from 'src/models/resident';


export function onlyManager (req: Request, res: Response,next:NextFunction) {
    if(!res.locals.token){
        return res.sendStatus(403);
    }

    const loginData = res.locals.token as LoginData & { profile: Profile};
    
    if(loginData.profile == Profile.MANAGER){
        return next();
    }else{
        return res.sendStatus(403);
    }
}


export function onlyCounselour (req: Request, res: Response,next:NextFunction) {
    if(!res.locals.token){
        return res.sendStatus(403);
    }

    const loginData = res.locals.token as LoginData & { profile: Profile};

    if(loginData.profile != Profile.RESIDENT){
        return next();
    }else{
        return res.sendStatus(403);
    }
}