const mongoose = require('mongoose');
const Schema = mongoose.Schema

const DishSchema = new Schema({
    dishID: {
        type: mongoose.Schema.Types.ObjectId, 
        unique: true
    },
    name: String,
    category: String,
    price: Number,
    description: String,
    image: String,
    status: String
})

module.exports = mongoose.model('Dish', DishSchema, 'Dish')