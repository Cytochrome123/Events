import 'dotenv/config';
// import { env } from 'process';
import express, { Express, NextFunction, Request, Response } from "express";
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import session from 'express-session'
import mongoose from "mongoose";
import User from './model/user';

// import {userRoutes} from './routes/user'
// import {eventRoutes} from './routes/event'
import {userRoutes, eventRoutes} from './routes'

const app: Express = express();

app.use(express.json());

declare const process: {
    env: {
      [key: string]: string
    }
}

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('Database connected');
}).catch(err => console.log(err))

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email: string, password: string, done: Function) => {
            try {
                let condition = { email };
                let projections = {};
                let option = { lean: true };

                let user = await User.findOne( condition, projections, option );

                if(user) {
                    // if (!user.status === 'pending') {
                    //     return done( null, false, {msg: 'Your account is still pending, check back later.Thanks'})
                    // }
                    // let correlates = factory.compareHashedPassword(password, user.password);
                    // if(correlates) {
                        return done(null, user);
                    // }
                    // return done(null, false, {msg: 'Incorrect password!!'});
                }
                return done(null, false, {msg: 'Your account does\'nt exist'});
            } catch (err) {
                throw err;
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user._id.toString());
});

interface jwtPayload {
    userId: string
    role: string
}

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'process.env.JWT_SECRET',

        },
        async (jwtPayload: jwtPayload, done: Function) => {
            // let query = { _id: mongoose.Types.ObjectId(jwtPayload.userId) };
            let query = { _id: jwtPayload.userId };

            let projections = { userType: 1, status: 1 };
            let options = { lean: true };

            let user = await User.findOne(
                query,
                projections,
                options
            );
            // if (user && user.userType === jwtPayload.role) {
            if (user) {
                // req.user = user
                return done(null, user);
            } else {
                return done(null);
            }
        }
    )
);

// app.all('*', (req, res, next) => {
// 	passport.authenticate('jwt', { session: false }, (err: unknown, user: object, info: any) => {
// 		if (!req.headers.authorization) {
// 			res.status(401).send({ msg: 'Missing authentication' });
// 		} else if (err || !user) {
// 			res.status(401).send({ msg: 'Invalid token' });
// 		} else {
// 			req.user = user;
// 			next();
// 		}
// 	})(req, res, next);
// });

app.use(session({
    secret: 'Event',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', userRoutes);
app.use('/api', eventRoutes)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ data: { msg: 'Hello'} })
});

app.use((req, res, next) => {
    next(Error('Endpoint not found'))
})


app.use(( err: unknown, req: Request, res: Response, next: NextFunction ) => {
    console.log(err);
    let errMsg = 'An unknown error occured';
    if (err instanceof Error) errMsg = err.message;
    res.status(500).json({err: errMsg})

})


app.listen(8000, () => console.log('Event server started'));