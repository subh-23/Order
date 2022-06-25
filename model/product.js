const mongoose = require('mongoose')

//designing a product model
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true
    },
    product_type: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        default: "Not Ordered"
    }
}
)
module.exports = mongoose.model('product', productSchema)