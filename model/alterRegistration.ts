import mongoose, { Schema } from 'mongoose';

interface Event {
    userID?: string;
	eventID?: string;
	payment: boolean;
    dynamicField: Map<string, any>;
}

const eventSchema: Schema<Event> = new Schema({
	userID: { type: Schema.Types.ObjectId, ref: 'User'},
    eventID: { type: mongoose.Types.ObjectId, ref: 'Event' }, 
    payment: { type: Boolean, required: true, default: false},
    dynamicField: { type: Map, of: Schema.Types.Mixed },
});

const Eventa = mongoose.model<Event>('Event', eventSchema);


export default Eventa