import express from 'express'
const router = express.Router()
import Author from '../models/author.js'
import Book from '../models/book.js'

// All Authors Route
router.get('/', async (req, res) => {
    const searchOptions = {}
    if (req.query.name) {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { authors: authors, searchOptions: req.query }) // searchOptions should be query right?
    } catch {
        res.redirect('/')
    }
})

// New author route
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() })
})

// creator author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
    } catch (e) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'The error: ' + e,
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const booksByAuthor = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show', { author, booksByAuthor })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author })
    } catch {
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if (!author) res.redirect('/')
        else res.render('authors/edit', {
            author,
            errorMessage: 'Error Updating author'
        })
    }
})

router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.deleteOne()
        res.redirect('/authors')
    } catch (e) {
        if (!author) res.redirect('/')
        else res.redirect(`/authors/${author.id}`)
        console.log(e)
    }
})



export default router

