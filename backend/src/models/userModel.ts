import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

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
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
}

// Then, define the schema
const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
    }, // Primary Key
    fullname: {
      type: String,
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: Date,
      default: Date.now, // Auto-sets to current date
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"], // We can enforce specific values
    },
  },
  { strict: true } // Disallow extra / unexpected fields from pushing through db
);

// Pre-hook to hash password before saving
UserSchema.pre("save", async function (next) {
  const user: IUser = this as IUser;

  // Check if password is long enough
  if (user.password && user.password.length < 8) {
    return next(new Error("Password must be at least 8 characters long."))
  }

  if (!user.isModified("password")) return next();

  try {
    const salt: string = await bcrypt.genSalt(10); // Generate Salt
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Add method for password comparison
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
