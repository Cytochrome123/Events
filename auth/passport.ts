// const passport =  require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');


// const user = require('../model')
const {User} = require('../model');
// const {queries} = require('../db');
// const {factory} = require('../config');


// const comparePassword = async (typedPassword, user, done) => {
//     let isSame = factory.compareHashedPassword(typedPassword, user.password);

//     // let isSame = true;

//     if(isSame) {
//         let update = { lastLogin: 100 };

//         await queries.update(User, {_id: user._id}, update, {lean: true});
//         return done(null, user);
//     } else {
//         return done(null, false, {msg: 'Incorrect password!!'});
//     }
// };



// const passportStrategy = ()

module.exports = (passport: any) => {
    // passport.use(new LocalStrategy(User.authenticate()));
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'votersID',
                passwordField: 'password'
            },
            async (votersID: string, password: string, done: Function) => {
                try {
                    let condition = { votersID };
                    let projections = {};
                    let option = { lean: true };

                    let user = await User.findOne( condition, projections, option );

                    if(user) {
                        if (user.status === 'pending') {
                            return done( null, false, {msg: 'Your account is still pending, check back later.Thanks'})
                        }
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

    passport.serializeUser((user, done) => {
		done(null, toString(user._id));
	});

    passport.use(
		new JwtStrategy(
			{
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
				secretOrKey: process.env.JWT_SECRET,

			},
			async (jwtPayload, done) => {
				let query = { _id: mongoose.Types.ObjectId(jwtPayload.userId) };
				let projections = { userType: 1, collegeId: 1, subAdmin: 1 };
				let options = { lean: true };

				let user = await queries.findOne(
					User,
					query,
					projections,
					options
				);

				if (user && user.userType === jwtPayload.role) {
                    // req.user = user
					return done(null, user);
				} else {
					return done(null);
				}
			}
		)
	);
}