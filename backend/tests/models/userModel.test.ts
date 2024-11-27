import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from "../../src/models/userModel";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

describe('Mongoose Model Validation: User', () => {
    it('should require required fields', async () => {
        const user = new User({}); // Missing required fields
        await expect(user.validate()).rejects.toThrow(); // Rejects the user since it has missing details
    });

    it('should save a user with valid fields', async () => {
        const user = new User({
            userID: 'U123',
            fullname: 'John Doe',
            idNumber: '12345',
            username: 'johndoe',
            email: 'johndoe@example.com',
            password: 'hashedpassword',
            role: 'Admin',
            position: 'Manager',
            department: 'HR',
            status: 'Active',
        });

        const savedUser = await user.save(); // Save the user by inserting it to db
        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe('johndoe@example.com');
    });

    it ('should set default dateCreated to now', async () => {
        const user = new User({
            userID: 'U456',
            fullname: 'Jane Doe',
            idNumber: '67890',
            username: 'janedoe',
            email: 'janedoe@example.com',
            password: 'hashedpassword',
            role: 'User',
            position: 'Engineer',
            department: 'IT',
            status: 'Active',
        });
        const savedUser = await user.save();
        expect(savedUser.dateCreated).toBeDefined(); // We ensure that date exists first
        expect(savedUser.dateCreated.getTime()).toBeLessThanOrEqual(Date.now()); // We compare the date created to the latest date available
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});