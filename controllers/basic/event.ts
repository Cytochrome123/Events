import {  RequestHandler, Request, Response, NextFunction } from "express";
import qr from 'qrcode';
import Event from "../../model/event";

// import {  RequestHandler, Request } from "express";
// import User from '../model/user';
import Registration from "../../model/registeration";
// // import {Registration} from '../model'

// import mongoose from "mongoose";


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

export const register4Event = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: any = req.user;
        const { id } = req.params;
        const { firstName, lastName, email, phoneNumber } = req.body
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
                    firstName: String,
                    lastName: String,
                    email: String,
                    phoneNumber: Number,
                    events: object[],
                    title: string
                }
                console.log(userData)
                const addEvent: add = {
                    userID: userData ? userData._id : null,
                    firstName: userData ? userData.firstName : firstName,
                    lastName: userData ? userData.lastName : lastName,
                    email: userData ? userData.email : email,
                    phoneNumber,
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
                await new Registration(addEvent).save();
                // send the event details to their mail ---------**************************************************details and ticket he needs for the event
                if(userData) {
                    const qrData = JSON.stringify({firstName, lastName, email, phoneNumber});
                    const code = await qr.toDataURL(qrData);
                    // send through mail
                    console.log(code)
                }
                res.status(200).json({ data: { msg: 'Event registeration sucessfully, procedd to payyyyy' } })
            }
        } else {
            res.status(200).json({ data: { msg: 'You shouldnt be here fam' } })
        }
    } catch (err) {
        next(err)
    }
}