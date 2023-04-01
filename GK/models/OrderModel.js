const mongoose = require('mongoose');
const Schema = mongoose.Schema

const OrderSchema = new Schema({
    cart: {type: Object, default: null},
    table: Number,
    checkin: { type: Date, default: Date.now },
    checkout: { type: Date, default: null },
    status: { type: String, default: 'Processing' }
})

module.exports = mongoose.model('Order', OrderSchema)