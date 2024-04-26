import express from 'express'
import Book from '../models/book.js'
import Author from '../models/author.js'

const router = express.Router()

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
    renderFormPage(res, new Book(), 'new')
})

// Create Book Route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    })

    saveCover(book, req.body.cover)

    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch (er) {
        renderFormPage(res, book, 'new', true, er)
    }
})

// Show book route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        if (!book.author) book.author = { id: 'no id', name: 'no author' }
        res.render('books/show', { book })
    } catch (e) {
        // res.redirect('/')
        res.send(e)
    }
})

// Edit book route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderFormPage(res, book, 'edit')
    } catch { res.redirect('/') }
})


// Update Book Route
router.put('/:id', async (req, res) => {
    let book

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        if (req.body.cover) saveCover(book, req.body.cover)
        await book.save()
        res.redirect(`/books/${book.id}`)

    } catch (er) {
        if (book) renderFormPage(res, book, 'edit', true, er)
        else res.redirect('/')
    }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.deleteOne()
        res.redirect('/books')
    } catch {
        if (book) {
            res.render('books/show', {
                book,
                errorMessage: 'Could not remove book'
            })
        } else res.redirect('/')
    }
})

async function renderFormPage(res, book, form, hasError = false, er) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = `Error ${form == 'new' ? 'Creating' : 'Updating'} Book: ` + er
        res.render(`books/${form}`, params)
    } catch {
        res.redirect('/books')
    }
}



function saveCover(book, coverEncoded) {
    if (!coverEncoded) return
    const cover = JSON.parse(coverEncoded)
    if (cover && ['image/jpeg', 'image/png', 'image/gif'].includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}


export default router

