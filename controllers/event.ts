import { RequestHandler } from "express";

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









export const checkInToEvent: RequestHandler = async (req, res, next) => {
    try {
        const qrDetails = req.body;
        const {eventID} = req.params;

        const user: any = await User.findOne({email: qrDetails.email})
        if(user) {

            const registration = await Registration.findOne({email: qrDetails.email})
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

export const createScanner: RequestHandler = async (req, res, next) => {
    try {
        const { scannerName } = req.body;
        const { eventID } = req.params;
        // const registrations = await Registration.find({'events.eventID': eventID})
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

        const registrations = await Registration.aggregate(aggregatePipeline, { lean: true })
        // console.log(registrations) 
        for (let i = 0; i < registrations.length; i++) {
            // console.log(registrations[i].events)
            const dyn: any  = registrations[i].events[0].dynamicField
            // dyn.set(scannerName, false)
            dyn[scannerName] = false;
            await Registration.updateMany(
                { _id: new mongoose.Types.ObjectId(registrations[i]._id), 'events.eventID': new mongoose.Types.ObjectId(eventID)},
                { $set: { 'events.$.dynamicField': dyn }}
            )
        }
        // res.json({registrations, up})
        res.status(200).json({msg: 'Scanner created sucessfully '})
        // registrations.forEach(registration => {
        //     registration.events[0].dynamicField.set(scannerName, false)
        // })
    } catch (err) {
        next(err);
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

