import mongoose from 'mongoose'
import Book from './book.js'

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('deleteOne', { document: true }, async function (next) {
    const books = await Book.find({ author: this.id })
    if (books) next(new Error('This Author has books still'))
    else next()
})

export default mongoose.model('Author', authorSchema)