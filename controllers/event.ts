import { NextFunction, RequestHandler, Request, Response } from "express";

// import {  RequestHandler, Request } from "express";
import User from '../model/user';
import Event from '../model/event';
import Registration from "../model/registeration";
// import {Registration} from '../model'

import mongoose from "mongoose";
import Test from "../model/dynamic";

// interface User {
//     _id: mongoose.Types.ObjectId
// }


export const getAllEvents: RequestHandler = async (req, res, next) => {
    try {
        const events = await Event.find()
        if (events) {
            res.status(200).json({ data: { events } })
        } else {
            res.status(400).json({ data: { msg: 'No event' } })
        }
    } catch (err) {
        next(err)
    }
}

export const createEvent: RequestHandler = async (req: Request, res, next) => {
    try {
        // @ignore
        const userData: any = req.user;
        const eventDetails = req.body;

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

export const getEvent: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);
        if (event) {
            res.status(200).json({ data: { event } })
        } else {
            res.status(200).json({ data: { msg: 'Not found' } })
        }

    } catch (error) {
        next(error)
    }
}

// export const test = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const userData: any = req.user;
//         const { id } = req.params;
//         let aggregatePipeline = [
//             { $match: { _id: mongoose.Types.ObjectId(userData._id) } },
//             {
//                 $lookup: {
//                     from: 'registration',
//                     // localField: '_id',
//                     // foreignField: 'course',
//                     let: { userID: '$userID' },
//                     pipeline: [
//                         {
//                             $match: {
//                                 $expr: {
//                                     $and: [
//                                         { $eq: ['$_id', '$$userID'] },
//                                         // { $gte: ['$examDate', startOfMonth] },
//                                         // { $lte: ['$examDate', endOfMonth] },
//                                     ],
//                                 },
//                             },
//                         },
//                     ],
//                     as: 'allExams'
//                 }
//             },
//             { $unwind: '$allExams' },
//             {
//                 $project: {
//                     status: 1,
//                     // examId: 1,
//                     marksObtained: 1,
//                     attemptedQuestionsCount: 1,
//                     correctAnswerCount: 1,
//                     'allExams._id': 1,
//                     'allExams.examDate': 1,
//                     'allExams.course': 1,
//                     'allExams.subject': 1,
//                     'allExams.examCode': 1,
//                 }
//             }
//         ];
//     } catch (error) {
        
//     }
// }

export const register4Event = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: any = req.user;
        const { id } = req.params;
        const { email } = req.body
        const event = await Event.findById(id);

        if (event) {
            console.log(event)
            // const registered = await Registration.findOne({ userID: userData._id })
            const registered = await Registration.findOne({ email })
            if (registered) {
                console.log(registered)
                let exists;
                // registered.forEach(registration => {
                // console.log(registered.events)
                // console.log(event._id)
                // this find doesn't look good  --  or try to remodel the database
                exists = registered.events.find(list => list.eventID?.toString() === event._id.toString());
                // console.log(list.eventID);
                //     console.log('---')
                //     console.log(event._id)
                //     console.log(new mongoose.Types.ObjectId('63f520d66aaac41df173ef01'));
                console.log(exists)
                if (exists) {
                    res.status(400).json({ data: { msg: 'You have registered for the selected event before, proceed to make payment if you have not done so' } })
                }
                else {
                    // interface addEvent {
                    //     eventID: any,
                    //     payment: boolean
                    // }
                    // const dyn = event.registrationData[0];
                    const fullDyn = new Map([])
                    event.registrationData.forEach(data => {
                        fullDyn.set(data, req.body[data])
                    })
                    // event.registrationData.forEach(data => {
                    //     return {
                    //         ...
                    //     }
                    // })
                    const addEvent = {
                        $push: {
                            events: {
                                eventID: event._id,
                                payment: false,
                                dynamicField: fullDyn
                            }
                        }
                    }
                    const register = await Registration.findOneAndUpdate({userID: userData._id}, addEvent, {new: true, lean: true})
                    if(register){

                        res.status(200).json({ data: { msg: 'Event registeration sucessfully, procedd to pay' } })
                    } else {
                        res.status(200).json({ data: { msg: 'Registration failed' } })
                    }
                }
            } else {
                interface add {
                    userID: string,
                    events: object[],
                    title: string
                }
                const addEvent: add = {
                    userID: userData._id,
                    events: [],
                    title: event.title
                }
                console.log(addEvent)
                const fullDyn = new Map([])
                // For the real value (from the req.body) that would be stored in an array and gotten with a for loop i.e the forEach wil be converted
                event.registrationData.forEach(data => {
                    fullDyn.set(data, req.body[data])
                })
                addEvent.events.push({
                    eventID: event._id,
                    payment: false,
                    dynamicField: fullDyn
                    // dynamicField: {
                    //     [event.registrationData[0]]: 12
                    // }
                })
                await new Registration(addEvent).save()
                res.status(200).json({ data: { msg: 'Event registeration sucessfully, procedd to payyyyy' } })
            }
        } else {
            res.status(200).json({ data: { msg: 'You shouldnt be here fam' } })
        }
    } catch (err) {
        next(err)
    }
}

export const getRegisteredEvents: RequestHandler = async (req, res, next) => {
    try {
        const myDetails: any = req.user!;
        const populateOptions = {
            path: 'events.eventID',
            select: '_id title description location passcode',
            model: 'Event'
        };

        // const registeration = await Registration.findOne({userID: myDetails._id})
        const registeration = await Registration.findOne({email: myDetails.email})
        .populate(populateOptions).exec()
        if(registeration) {
            const events = registeration.events
            res.status(200).json({data: {events}})
        } else {
            res.status(200).json({msg: 'You r yet to register for an event'})
        }
    } catch (err) {
        next(err)
    }
}

export const getCreatedEvents: RequestHandler = async (req, res, next) => {
    try {
        const myDetails: any = req.user;
        // const events = await Event.fin
        let condition = { userID: new mongoose.Types.ObjectId(myDetails._id)};

        const events = await Event.find(condition)
        if(events) {
            const count = await Event.countDocuments(condition);
            res.status(200).json({data: {events, count}})
        } else {
            res.status(400).json({msg: 'No event created, proceed to create one' })
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

        // JUST didn't feel like using the findByIdAndUpdate lol

        const event = await Event.findById(id);
        if(event && event.userID?.toString() === userDetails._id.toString()) {
            Object.assign(event, updateDetails);
            const updatedEvent = await event.save();
            res.status(200).json({updatedEvent})
        } else {
            res.status(200).json({msg: 'The event doesn\'t exist'})
        }
    } catch (err) {
        next(err)
    }
}

export const checkInToEvent: RequestHandler = async (req, res, next) => {
    try {
        const qrDetails = req.body;
        const {eventID} = req.params;

        const user: any = await User.findOne({email: qrDetails.email})
        if(user) {

            const registration = await Registration.findOne({userID: user._id})
            if(registration) {

                // for (let i = 0; i < registration.events.length; i++) {
                //     const event = registration.events[i];
                //     const event_id = new mongoose.Types.ObjectId(eventID);
                //     if (event.eventID?.toString() === event_id.toString() && event.payment) {
                //         const eventDetails = await Event.findById(eventID);
                //         const alreadyIn = eventDetails?.attendees.some(attendee => {
                //             console.log(attendee.toString());
                //             console.log('asdfg')
                //             console.log(user._id.toString())
                //             return attendee.toString() === user._id.toString();
                //         });
                //         console.log(alreadyIn)
                //         if (alreadyIn) {
                //             res.status(400).json({ msg: 'User\'s already checked in' });
                //             break;
                //         } else {
                //             eventDetails?.attendees.push(user._id);
                //             await eventDetails?.save();
                //             res.status(200).json({ msg: 'Check-in successful' });
                //             break;
                //         }
                //     } else {
                //         // Check if this is the last iteration
                //         if (i === registration.events.length - 1) {
                //             res.status(400).json({ msg: 'You probably haven\'t registered for this event or make sure you\'ve paid' });
                //         } else {
                //             continue;
                //         }
                //     }
                
                // }
                

                // I DONT" KNOW, JUST LOVE THIS FOR OF, SO I"LL KEEP THAT
                
                const eventsIterator = registration.events.entries();
                for (const [index, event] of eventsIterator) {
                    const event_id = new mongoose.Types.ObjectId(eventID);
                    if (event.eventID?.toString() === event_id.toString() && event.payment) {
                        const eventDetails = await Event.findById(eventID);
                        const alreadyIn = eventDetails?.attendees.some(attendee => (attendee.toString() === user._id.toString()));
                        console.log(alreadyIn)
                        if (alreadyIn) {
                            res.status(400).json({ msg: 'User\'s already checked in' });
                            break;
                        } else {
                            eventDetails?.attendees.push(user._id);
                            await eventDetails?.save();
                            res.status(200).json({ msg: 'Check-in successful' });
                            break;
                        }
                    } else {
                        // Check if this is the last iteration
                        const nextElement = eventsIterator.next();
                        console.log(index)
                        if (nextElement.done) {
                            res.status(400).json({ msg: 'You probably haven\'t registered for this event or make sure you\'ve paid' });
                        } else {
                            continue;
                        }
                    }

                }


            } else {
    
                res.status(400).json({msg: 'User didn\'t register for the event'});
            }
        } else {
            res.status(400).json({msg: 'User not found'})
        }

        // if (checkedIn) {
        // return res.status(200).json({ msg: 'Check-in successful' });
        // } else {
        // return res.status(400).json({ msg: 'User didn\'t register for the event' });
        // }
        // a for loop would have been better ----- will change later
        // registration.events.forEach(async event => {
        //     const event_id = new mongoose.Types.ObjectId(eventID)
        //     if(event.eventID?.toString() === event_id.toString() && event.payment) {
        //         const event = await Event.findById(eventID)
        //         const alreadyIn = event?.attendees.some(attendee => attendee === qrDetails._id)
        //         if(alreadyIn) return res.status(400).json({msg: 'User\'s already checked in' })
        //         event?.attendees.push(qrDetails._id)
        //         await event?.save()
        //         return res.status(200).json({msg: 'Checkked in sucessful'})
        //     }
        //     return res.status(400).json({msg: 'User didn\'t register for the event'});
        // })
    } catch (error) {
        next(error)
    }
}

export const test: RequestHandler = async (req, res, next) => {
    try {
        const testObj = {
            name: 'test',
            dynamicField: new Map([['test1', 'test2'],['test3', 'zxcv']])
        };

        const test = await new Test(testObj).save()
        res.status(200).json({data: {test}});
    } catch (err) {
        next(err)
    }
}

export const getRegistrationList: RequestHandler = async (req, res, next) => {
    try {
        const { eventID } = req.params;
        console.log(req.params)
        const registrations = await Registration.find({ events: { $elemMatch: { eventID: eventID } } }, { 'events.$': 1 }).exec();
        if(registrations) {
            // registrations.map(registration => registration.events[0])
            res.json({registrations})
        } else {
            res.status(400).json({msg: 'No registrations for ur event ATM!!!'})
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