const mongoose = require('mongoose')

//designing a friend model
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true
    }
}
)
module.exports = mongoose.model('order', UserSchema)