import express from 'express'
import Book, { coverImageBasePath } from '../models/book.js'
import Author from '../models/author.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()
const uploadPath = path.join('public', coverImageBasePath)
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => cb(null, file.originalname)
    }),
    fileFilter: (req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)),
})

// All Books Route
router.get('/', async (req, res) => {

    let query = Book.find()
    if (req.query.title) query = query.regex('title', new RegExp(req.query.title, 'i'))
    if (req.query.publishedBefore) query = query.lte('publishDate', req.query.publishedBefore)
    if (req.query.publishedAfter) query = query.gte('publishDate', req.query.publishedAfter)

    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect(`books`)
    } catch (er) {
        if (book.coverImageName) removeBookCover(book.coverImageName)
        renderNewPage(res, book, true, er)
    }
})

function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.log(err)
    })
}

async function renderNewPage(res, book, hasError = false, er) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book: ' + er
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}

export default router

