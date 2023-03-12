import { RequestHandler, Request } from "express";

// import {  RequestHandler, Request } from "express";
import { userType } from '../../model/user';
import Event from '../../model/event';
import Registration from "../../model/registeration";
// import {Registration} from '../model'

import mongoose from "mongoose";

export const createEvent: RequestHandler = async (req: Request, res, next) => {
    try {
        // @ignore
        const userData: any = req.user;
        const eventDetails = req.body;

        if (userData.role !== userType.admin || userData.role !== userType.organizer) {
            throw new Error('Not authorized to access this endpoint ADMIN/ORGAnizer')
            // next()
        }

        const exists = await Event.findOne({ title: eventDetails.title });
        if (!exists) {
            // eventDetails._id = mongoose.Types.ObjectId(userData._id)
            eventDetails.userID = userData._id

            await Event.create(eventDetails);
            res.status(200).json({ data: { msg: 'Event created!!!' } })
        } else {

            res.status(400).json({ data: { msg: 'Event with the title exists!!!' } })
        }
    } catch (err) {
        next(err)
    }
}

export const getCreatedEvents: RequestHandler = async (req, res, next) => {
    try {
        const myDetails: any = req.user;


        if (myDetails.role !== userType.admin || myDetails.role !== userType.organizer) {
            throw new Error('You don\'t have access to this');
        }
        // const events = await Event.fin
        let condition = { userID: new mongoose.Types.ObjectId(myDetails._id) };

        const events = await Event.find(condition)
        if (events) {
            const count = await Event.countDocuments(condition);
            res.status(200).json({ data: { events, count } })
        } else {
            res.status(400).json({ msg: 'No event created, proceed to create one' })
        }

        console.log(events)


    } catch (err) {
        next(err)
    }
}

export const updateEvent: RequestHandler = async (req, res, next) => {
    try {
        const userDetails: any = req.user!
        const { id } = req.params;
        const updateDetails = req.body;

        if (userDetails.role !== userType.admin || userDetails.role !== userType.organizer) {
            throw new Error('You don\'t have access to this');
        }

        // JUST didn't feel like using the findByIdAndUpdate lol

        const event = await Event.findById(id);
        if (event && event.userID?.toString() === userDetails._id.toString()) {
            Object.assign(event, updateDetails);
            const updatedEvent = await event.save();
            res.status(200).json({ updatedEvent })
        } else {
            res.status(403).json({ msg: 'Not authorized' })
        }
    } catch (err) {
        next(err)
    }
}

export const getRegistrationList: RequestHandler = async (req, res, next) => {
    try {
        const userDetails: any = req.user;
        const { eventID } = req.params;
        console.log(eventID)
        console.log(new mongoose.Types.ObjectId(eventID))

        if(userDetails.role !== userType.admin || userDetails.role !== userType.organizer) {
            throw new Error('You don\'t have access to this');
        }

        const event = await Event.findById(eventID);
        if(event?.userID !== userDetails._id) res.status(403).json({msg: 'Not Authorized to ge this'})
        // , { 'events.$': 1 }
        // const registrations = await Registration.find({ events: { $elemMatch: { eventID: eventID } } }).exec();
        const aggregatePipeline = [
            { $match: { 'events.eventID': new mongoose.Types.ObjectId(eventID) } },
            { $project: {
                firstName: 1,
                lastName: 1,
                email: 1,
                phoneNumber: 1,
                events: { $filter: { input: '$events', as: 'e', cond: { $eq: ['$$e.eventID', new mongoose.Types.ObjectId(eventID)] } } }
            } }
        ];

        const registrations = await Registration.aggregate(aggregatePipeline).exec()
        if (registrations) {
            // registrations.map(registration => registration.events[0])
            res.json({ registrations })
        } else {
            res.status(400).json({ msg: 'No registrations for ur event ATM!!!' })
        }
        // const registrationForMyEvent = await Registration.find()
        // if(registrationForMyEvent) {
        //     let filtered: Array<object> = [{}]
        //     let yyy = false;
        //     registrationForMyEvent.forEach(event => {
        //         // console.log(event)
        //         filtered = event.events.filter(eve => {
        //             console.log(eve.eventID)
        //             console.log(new mongoose.Types.ObjectId( eventID ))
        //             return eve.eventID?.toString() === new mongoose.Types.ObjectId( eventID ).toString()
        //         })
        //     })
        //     // for(let i=0; i< registrationForMyEvent.length; i++) {
        //     //     for (let j = 0; j < registrationForMyEvent[i].events.length; j++) {
        //     //         // const element = array[j];
        //     //         const hold = registrationForMyEvent[i].events[j].eventID!
        //     //         console.log(hold.toString() === new mongoose.Types.ObjectId( eventID ).toString());
        //     //     }
        //     // }
        //     res.json({filtered, yyy})
        // } 
    } catch (err) {
        next(err)
    }
}