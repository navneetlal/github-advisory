import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import mongoDb from './database/mongo'
import { log4js } from './logger'

import controllers from './controllers'
import search from './controllers/search'
import { MongoServerError } from 'mongodb'

const PORT = 3000
const logger = log4js.getLogger()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send('All is well!')
})

app.use('/init', controllers)
app.use('/search', search)

app.listen(PORT, async () => {
    await mongoDb.connect()
    logger.info('MongoDb connection established')
    logger.info('Initializing database')
    await mongoDb.initialize()
    logger.info(`Starting app at http://localhost:${PORT}`)
})