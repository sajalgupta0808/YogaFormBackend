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
app.get('/', (req, resp) => {
    resp.send('Hello World')
})

// login api
app.post('/api/login', async (req, resp) => {
    const { email, password } = req.body

    const user = await user.findOne({ email })
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    response
        .status(200)
        .send("Logged in")
})

// get data
//member id: user data dashboard

app.post('/api/register', async (req, resp) => {
    const { name, email, age, joiningDate, batch, password } = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new user({
        name,
        email,
        age,
        joiningDate,
        batch,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

app.listen(PORT)

// Error handling middleware
const unknownEndpoint = (req, resp) => {
    resp.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
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
