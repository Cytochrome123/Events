import { RequestHandler } from "express";

// import {  RequestHandler, Request } from "express";
// import User, { userType } from '../../model/user';
// import Event from '../../model/event';
import Registration from "../../model/registeration";
// import {Registration} from '../model'

// import mongoose from "mongoose";

export const getRegisteredEvents: RequestHandler = async (req, res, next) => {
    try {
        const myDetails: any = req.user!;
        const populateOptions = {
            path: 'events.eventID',
            select: '_id title description location passcode',
            model: 'Event'
        };

        if(myDetails._id) {

            const registeration = await Registration.findOne({userID: myDetails._id})
            // const registeration = await Registration.findOne({email: myDetails.email})
            .populate(populateOptions).exec()
            if(registeration) {
                const events = registeration.events
                res.status(200).json({data: {events}})
            } else {
                res.status(200).json({msg: 'You r yet to register for an event'})
            }
        } else {
            res.status(403).json({msg: 'You need to be logged in to view registered events'})
        }

    } catch (err) {
        next(err)
    }
}