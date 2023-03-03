import mongoose, { Schema, InferSchemaType, model } from "mongoose";


const registrationSchema = new Schema({
    userID: { type: mongoose.Types.ObjectId },
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: Number,
    events: [{
        eventID: { type: mongoose.Types.ObjectId, ref: 'Event' }, 
        payment: { type: Boolean, required: true, default: false},
        dynamicField: { type: Map, of: Schema.Types.Mixed },
    }],
    // title: { type: String, required: true, lowercase: true, index: true },
}, {timestamps: true });

// const registrationSchema = new Schema({
//     userID: { type: mongoose.Types.ObjectId, required: true },
//     eventID: { type: mongoose.Types.ObjectId, required: true },
//     paid: { type: Boolean, default: false, required: true }
//     // title: { type: String, required: true, lowercase: true, index: true },
// }, {timestamps: true });

type Registration = InferSchemaType<typeof registrationSchema>

export default model<Registration>('Registration', registrationSchema);