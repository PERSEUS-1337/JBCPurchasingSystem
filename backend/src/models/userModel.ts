import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

// Extend IUser with custom instance methods
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

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getPublicProfile(): Promise<Partial<IUser>>;
  getAdminView(): Promise<Partial<IUser>>;
}


// Then, define the schema
const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
    },
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
      enum: [
        "Super Administrator",
        "Administrator",
        "Manager",
        "Staff",
        "Auditor",
        "Requester",
        "Approver",
        "Purchaser",
        "Inventory Clerk",
        "Accountant",
        "Project Lead",
        "Guest",
      ],
      default: "Staff",
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
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
    },
  },
  { strict: true }
);

// Pre-hook to hash password before saving
UserSchema.pre("save", async function (next) {
  const user: IUser = this as IUser;

  if (!user.isModified("password")) return next();

  try {
    const salt: string = await bcrypt.genSalt(10); // Generate Salt
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Secure User Schema POST Methods
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Secure User Schema GET Methods
UserSchema.methods.getPublicProfile = async function (): Promise<
  Partial<IUser>
> {
  const { password, __v, ...secureData } = this.toObject();
  return secureData;
};

UserSchema.methods.getAdminView = async function (): Promise<Partial<IUser>> {
  const { __v, ...secureData } = this.toObject(); // Exclude Mongoose version key
  return secureData; // Admin sees all except version
};

// // Static Method for Role-Specific Filtering
// UserSchema.statics.filterByRole = async function (
//   role: string
// ): Promise<Partial<IUser>[]> {
//   const users = await this.find({ role });
//   return users.map((user) => user.getPublicProfile());
// };

// Create and export model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema, "users");
export default User;
