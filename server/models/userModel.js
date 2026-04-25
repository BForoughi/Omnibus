import mongoose from "mongoose";
import bycrpt from 'bcryptjs'

const {Schema, model} = mongoose
// MongoDB User Schema
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true })
const userData = model('users', userSchema)

// Registering a user
export const addUser = async (username, password) => {
    try{
        const existingUser = await userData.findOne({ username }) // checking the username doesnt already exist for extra safety
        if (existingUser) return null

        const hashed = await bycrpt.hash(password, 10)
        const user = await userData.create({ username, password: hashed })
        return user
    } catch(err){
        // if username already exists mongo throws a duplicate error
        if(err.code === 11000) return null
        throw err
    }
};

// login
export const checkUser = async (username, password) => {
    try{
        const user = await userData.findOne({ username })
        if (!user) return null

        const match = await bycrpt.compare(password, user.password)
        if (!match) return null

        return user
    } catch(err){
        throw err
    }
}