import path from 'path'
import url from 'url'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const thisPath = __filename, thisDir = __dirname

import express from 'express'
import ejs from 'ejs'
import expressLayouts from 'express-ejs-layouts'
import mongoose from 'mongoose'
import bodyParser from 'body-parser' // deprecated

import indexRouter from './routes/index.js'
import authorRouter from './routes/authors.js'

(async () => {
    if (process.env.NODE_ENV != 'production') {
        const dotenv = await import('dotenv')
        dotenv.config()
    }

    try {
        mongoose.connect(process.env.DATABASE_URL)
        console.log('Connected to Mongoose')
    } catch (e) { console.log('Failed to connect: ' + e) }

})()


// I still have no idea what's happening here
const app = express()
app.set('view engine', 'ejs')
app.set('views', thisDir + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false })) // deprecated use...
// app.use(express.urlencoded({ limit: '10mb', extended: false }))

app.use('/', indexRouter)
app.use('/authors', authorRouter)


app.listen(process.env.PORT || 3000, () => console.log('PORT: ' + process.env.PORT))


