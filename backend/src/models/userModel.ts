import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import {
  defaultRole,
  defaultStatus,
  roleList,
  statusList,
  superAdmin,
} from "../constants";

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
  isSuperAdmin(): Promise<boolean>;
  getPersonalProfile(): Promise<Partial<IUser>>;
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
      enum: roleList,
      default: defaultRole,
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
      enum: statusList,
      default: defaultStatus,
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

UserSchema.post("find", (docs) => {
  docs.forEach((doc: { dateCreated: string | number | Date; }) => {
    if (doc.dateCreated && typeof doc.dateCreated === "string") {
      doc.dateCreated = new Date(doc.dateCreated);
    }
  });
});

UserSchema.post("findOne", (doc) => {
  if (doc && doc.dateCreated && typeof doc.dateCreated === "string") {
    doc.dateCreated = new Date(doc.dateCreated);
  }
});


// Secure User Schema POST Methods
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.isSuperAdmin = async function (): Promise<boolean> {
  return this.role === superAdmin;
};

// GET Methods
UserSchema.methods.getPersonalProfile = async function (): Promise<
  Partial<IUser>
> {
  const { _id, userID, role, password, idNumber, __v, ...secureData } =
    this.toObject();
  return secureData; // General users get their profile without sensitive data
};

UserSchema.methods.getAdminView = async function (): Promise<Partial<IUser>> {
  const { _id, password, __v, ...secureData } = this.toObject(); // Exclude password and version key
  return secureData; // Admin sees all but not password
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
