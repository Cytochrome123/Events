import { Schema, InferSchemaType, model } from "mongoose";

enum userType {
    admin = 'admin',
    user = 'user'
}

enum accountStatus {
    pending = 'pending',
    declined = 'declined',
    approved = 'approved'
}

const userSchema = new Schema({
	// _id: { type: mongoose.Types.ObjectId },
    firstName: { type: String, required: true, lowercase: true, index: true },
	lastName: { type: String, required: true, lowercase: true, index: true },
	email: { type: String, required: true },
	password: { type: String, required: true, default: null },
	phoneNumber: { type: String, required: true },
    userType: { type: String, required: true, enum: userType, default: 'user' },
	status: { type: String, required: true, enum: accountStatus, default: 'pending' },
	code: { type: String, required: true },
	// OTP: String,
	createdDate: { type: Number, default: Date.now },
	lastLogin: { type: Number, default: null },
}, {timestamps: true });

type User = InferSchemaType<typeof userSchema>

export default model<User>('User', userSchema);