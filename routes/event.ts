import express from "express";
import passport from "passport";

// import {getRegister} from '../controllers/user'
// import getRe
import * as eventController from "../controllers/event";
import { pay, verify } from "../controllers";

export const eventRoutes = express.Router()


eventRoutes.route('/events')
.get(passport.authenticate('jwt'), eventController.getAllEvents)
.post(passport.authenticate('jwt'), eventController.createEvent)

eventRoutes.route('/event/:id')
.get(passport.authenticate('jwt'), eventController.getEvent)
.patch(passport.authenticate('jwt'), eventController.updateEvent)

eventRoutes.route('/event/:id/register')
.post(passport.authenticate('jwt'), eventController.register4Event)

eventRoutes.get('/events/registered', passport.authenticate('jwt'), eventController.getRegisteredEvents)

eventRoutes.get('/events/created', passport.authenticate('jwt'), eventController.getCreatedEvents)

eventRoutes.route('/event/:eventID/check-in')
.post(eventController.checkInToEvent)

eventRoutes.route('/:eventID/pay')
.post(passport.authenticate('jwt'), pay)

eventRoutes.route('/:eventID/paystack/verify/:reference')
.get(passport.authenticate('jwt'), verify)

eventRoutes.get('/test', eventController.test)

eventRoutes.get('/myEven/:eventID', eventController.getRegistrationList)

// module.exports  = eventRoutes
