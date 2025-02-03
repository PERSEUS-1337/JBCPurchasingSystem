import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import {
  defaultRole,
  defaultStatus,
  roleList,
  statusList,
  superAdmin,
} from "../constants";

interface IUserMethods {
  // Instance Methods (Available on user instances
  comparePassword(candidatePassword: string): Promise<boolean>;
  // isSuperAdmin(): Promise<boolean>;
  getUser(): Promise<Partial<IUser>>;
  getUserAdminView(): Promise<Partial<IUser>>;
}

export interface IUser extends Document, IUserMethods {
  userID: string;
  fullname: string;
  email: string;
  password: string;
  role: string;
  position: string;
  department: string;
  dateCreated: Date;
  status: string;
}

// Static Methods (Available, regardless of instance)
interface IUserModel extends Model<IUser> {
  checkDuplicateUser(email: string): Promise<boolean>;
  isSuperAdmin(role: string): Promise<boolean>;
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
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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

// ### PRE and POST Hooks
// Hash password before it is saved to the database
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
  docs.forEach((doc: { dateCreated: string | number | Date }) => {
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

// STATIC METHODS, regardless if User or Not
UserSchema.statics.checkDuplicateUser = async function (
  email: string
): Promise<boolean> {
  const existingUser = await this.findOne({ email });
  return !!existingUser; // Convert the result to a boolean
};

UserSchema.statics.isSuperAdmin = async function (
  role: string
): Promise<boolean> {
  return role === superAdmin;
};

// INSTANCE METHODS for Individual User Objects
// GETTERS
UserSchema.methods.getUser = async function (): Promise<Partial<IUser>> {
  const { _id, userID, role, password, status, __v, ...secureData } =
    this.toObject();
  return secureData; // General users get their profile without sensitive data
};

UserSchema.methods.getUserAdminView = async function (): Promise<
  Partial<IUser>
> {
  const { _id, password, __v, ...secureData } = this.toObject();
  return secureData; // Admin sees all but not password
};

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser, IUserModel>("User", UserSchema, "users");

export default User;
