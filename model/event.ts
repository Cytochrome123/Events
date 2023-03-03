import mongoose, { Schema } from 'mongoose';

interface Event {
    userID?: string;
	title: string;
	description: string;
	location: string;
	passcode: string;
    // registrationData: Map<string, any>;
    registrationData: string[];
	ticketType: object;
	attendees: Array<object>;
	maxAttendees: number;
}

const eventSchema: Schema<Event> = new Schema({
	userID: { type: Schema.Types.ObjectId, ref: 'User'},
    title: { type: String, required: true, lowercase: true, index: true },
	description: { type: String, required: true },
	location: { type: String, required: true, lowercase: true, index: true },
	// startDateTime: { type: Date, required: true },
	// endDateTime: { type: Date, required: true },
	// date: { type: Date, required: false },
	// time: String,
	passcode: { type: String, required: true, default: null },
    registrationData: [],
	// ticketType: { type: Object, required: true },
	ticketType: { 
		Gold: {type: Number, default: 0},
		Silver: {type: Number, default: 0},
		Bronze: {type: Number, default: 0}
	},
	attendees: [ { type: mongoose.Types.ObjectId, default: [] } ],
	// location: { type: String, required: true },
	maxAttendees: { type: Number, required: true },
	// attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }]
});

export default mongoose.model<Event>('Event', eventSchema);


// export default Eventa

/**
 * ticketType: {
 * 		Gold: 1000,
 * 		Silver: 500,
 * 		Bronze: 200
 * }
 */




// import mongoose, { Schema, InferSchemaType, model } from "mongoose";


// const eventSchema = new Schema({
//     userID: { type: mongoose.Types.ObjectId, ref: 'User'},
//     title: { type: String, required: true, lowercase: true, index: true },
// 	description: { type: String, required: true },
// 	location: { type: String, required: true, lowercase: true, index: true },
// 	// startDateTime: { type: Date, required: true },
// 	// endDateTime: { type: Date, required: true },
// 	// date: { type: Date, required: false },
// 	// time: String,
// 	passcode: { type: String, required: true, default: null },
// 	attendees: [ { type: mongoose.Types.ObjectId, default: [] } ],
// 	// location: { type: String, required: true },
// 	maxAttendees: { type: Number, required: true },
// 	// attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }]
// }, {timestamps: true });

// type Event = InferSchemaType<typeof eventSchema>

// export default model<Event>('Event', eventSchema);