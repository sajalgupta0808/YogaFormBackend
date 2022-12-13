const mongoose = require('mongoose')
mongoose.set('strictQuery', false);
const isEmail = require('validator').isEmail

const url = process.env.DB_URI

mongoose
    .connect(url)
    .then(() => console.log('connected to Database'))
    .catch((err) => console.log(err))

const userSchema = new mongoose.Schema({
    name: String,
    passwordHash: String,
    age: Number,
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [isEmail, 'Invalid email address'],
    },
    batch: {
        type: Number,
        default: -1,  // -1: not a member, 0: 1 batch and so on, 1
    },
    joiningDate: Date,
    lastPaidMonth: Date,
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User

