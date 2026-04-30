import mongoose from 'mongoose'

const { Schema, model } = mongoose
const reviewSchema = new Schema({
    comicId: {type: String, required: true },
    comicType: {type: String, enum: ['issue', 'volume'], required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'userData', required: true},
    username: { type: String, required: true },
    title: { type: String, default: '' },
    body: { type: String, required: true },
    parentId: { type: Schema.Types.ObjectId, default: null } // null = top level review (no replies), has id = a reply
}, { timestamps: true })

export const Review = mongoose.model('Review', reviewSchema)