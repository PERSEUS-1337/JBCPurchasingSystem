import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for User Document
export interface IUser extends Document {
    userID: string; // Primary Key
    fullname: string;
    idNumber: string;
    username: string;
    email: string;
    password: string;
    role: string;
    position: string;
    department: string;
    dateCreated: Date;
    status: string;
}

// Then, define the schema
const UserSchema: Schema<IUser> = new Schema<IUser> ({
    userID: {
        type: String,
        required: true,
        unique: true
    }, // Primary Key
    fullname: {
        type: String,
        required: true,
    },
    idNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    username: { 
        type: String, 
        required: true,
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        required: true 
    },
    position: { 
        type: String, 
        required: true 
    },
    department: { 
        type: String, 
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now // Auto-sets to current date
    },
    status: {
        type: String,
        required: true,
        enum: ["Active", "Inactive"] // We can enforce specific values
    }
});

// Create and export model
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
export default User