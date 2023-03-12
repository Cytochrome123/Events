import express from "express";
import passport from "passport";

// import {getRegister} from '../controllers/user'
// import getRe
import * as basicEventController from "../controllers/basic/event"
import * as organizersController from '../controllers/organizer/event';
import * as usersController from '../controllers/user/event';
import * as eventController from "../controllers/event";
import { pay, verify } from "../controllers";

export const eventRoutes = express.Router()


eventRoutes.route('/events')
.get(passport.authenticate('jwt'), basicEventController.getAllEvents)
.post(passport.authenticate('jwt'), organizersController.createEvent)

eventRoutes.route('/event/:id')
.get(passport.authenticate('jwt'), basicEventController.getEvent)
.patch(passport.authenticate('jwt'), organizersController.updateEvent)

eventRoutes.route('/event/:id/register')
.post(passport.authenticate('jwt'), basicEventController.register4Event)

eventRoutes.get('/events/registered', passport.authenticate('jwt'), usersController.getRegisteredEvents)

eventRoutes.get('/events/created', passport.authenticate('jwt'), organizersController.getCreatedEvents)

eventRoutes.route('/event/:eventID/check-in')
.post(eventController.checkInToEvent)

eventRoutes.route('/:eventID/pay')
.post(passport.authenticate('jwt'), pay)

eventRoutes.route('/:eventID/paystack/verify/:reference')
.get(passport.authenticate('jwt'), verify)

eventRoutes.get('/test', eventController.test)

eventRoutes.get('/registration-list/:eventID', organizersController.getRegistrationList);

eventRoutes.route('/event/:eventID/create-scanner')
.post(eventController.createScanner)

// module.exports  = eventRoutes
