import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import ejs from 'ejs'
import indexRouter from './routes/index.js'
import mongoose from 'mongoose'


import path from 'path'
import url from 'url'
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const thisPath = __filename, thisDir = __dirname


const app = express()
app.set('view engine', 'ejs')
app.set('views', thisDir + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))


if (process.env.NODE_ENV != 'production') {
    import('dotenv').then(mod => {
        mod.config()
        mongoose.connect(process.env.DATABASE_URL)
        const db = mongoose.connection
        db.on('error', error => console.error(error))
        db.once('open', () => console.log('Connected to Mongoose'))
    })
}


app.use('/', indexRouter)


app.listen(process.env.PORT || 3000, () => console.log('PORT: 3000'))





