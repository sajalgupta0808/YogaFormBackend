require('dotenv').config()
const bcrypt = require('bcrypt')
const express = require('express')
const cors = require('cors')

const user = require('./model/User')

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8081



// API's
app.get('/', (req, res) => {
    res.send('Server running')
})

// login api
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body

    const User = await user.findOne({ email })
    const passwordCorrect = User === null
        ? false
        : await bcrypt.compare(password, User.passwordHash)

    if (!(User && passwordCorrect)) {
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }

    res.status(200)
        .json(User)
})

app.post('/api/batchChange', async (req, res) => {
    const { newBatch, id } = req.body

    const User = await user.findById(id)
    User.batch = newBatch
    User.lastPaidMonth = Date.now()
    const savedUser = await User.save()
    res.status(200).json({ success: true, user: savedUser })
})

app.get('/api/getUser/:id', async (req, res) => {

    const User = await user.findById(req.params.id)

    if (User === null) {
        res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json({ user: User })
})

app.post('/api/register', async (req, res) => {
    const { name, email, age, batch, password } = req.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const User = new user({
        name,
        email,
        age,
        joiningDate: Date.now(),
        batch,
        passwordHash,
    })

    const savedUser = await User.save()

    res.status(201).json(savedUser)
})

app.listen(PORT)

// Error handling middleware
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)
