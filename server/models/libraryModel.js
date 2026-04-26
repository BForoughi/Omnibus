import mongoose from 'mongoose'

const {Schema, model} = mongoose
const librarySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'userData',
        required: true
    },
    comicId: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['issue', 'volume'], // only allows these two values
        required: true 
    },
    title: { type: String },
    coverImage: { type: String },
    issueNumber: { type: String }, // only relevant for issues
    read: { 
        type: Boolean, 
        default: false // defaults to unread when first saved
    }
}, { timestamps: true })

// prevents the same user saving the same comic twice
libraryItemSchema.index({ userId: 1, comicId: 1 }, { unique: true })

export const LibraryItem = mongoose.model('LibraryItem', libraryItemSchema)
