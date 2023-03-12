import { RequestHandler, Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from '../../model/user';
import qr from 'qrcode';

// interface IUser

const createToken = (userData: any) => {
    let key = 'process.env.JWT_SECRET';
    let userObj = {
        // firstName: userData.firstName,
		// lastName: userData.lastName,
        // email: userData.email,
        userId: userData._id,
        role: userData.userType,
    }

    const token = jwt.sign(userObj, key);
    return token;
}

export const register: RequestHandler = async (req ,res, next) => {
    try {
        const {email} = req.body;

        const exists = await User.findOne({email});
        if(!exists) {
            let userObj;
            // const qrData = createToken(req.body);
            const qrData = JSON.stringify(req.body);
            const code = await qr.toDataURL(qrData);
            userObj = {...req.body, code}
            // (await User.create(req.body)).save()
            const q = await new User(userObj).save()
            res.status(201).json({ data: { msg: 'Signup successfully!', q} });
        } else {

            res.status(400).json({ data: { msg: 'Account already exists'} })
        }
    } catch (err) {
        next(err)
    }
}

export const login = (req: Request, res: Response, next: NextFunction) => {
    try {
        passport.authenticate('local', (err: any, user: any, info: any) => {
            if (err) return next(err);
            // if (err) throw err;
    
            if (!user) {
                console.log(user + '1')
                console.log(info)
                
                // res.send("User doesn't exist")
                return res.status(400).json({ msg: info.msg });
            }
            req.logIn(user, (err) => {
                if (err) return next(err);
                let token = createToken(user);
                
                return res.status(200).json({
                    token: token,
                    userId: user._id,
                    userType: user.userType,
                    lastLogin: user.lastLogin,
                    ...user
                });
            });
    
            
        })(req,res,next)
    } catch (err) {
        next(err)
    }
}