var express = require('express');
var router = express.Router();
var Dish = require('../models/DishModel')
var Cart = require('../models/CartModel')
var Order = require('../models/OrderModel')

router.get('/receipt', async (req, res) => {
    const now = new Date()
    var thisMonth = now.getMonth()
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // var thisMonth = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    // today = today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    var orders = await Order.find({ checkin: { $gte: today } }).sort('-checkin').lean().exec()
    Order.aggregate([
        {
            "$match": {
                checkin: { $gte: today }
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%d-%m-%Y",
                        "date": "$checkin"
                    }
                },
                "sum": { "$sum": '$cart.totalPrice' },
                "count": { "$sum": 1 }
            }
        },
        {
            "$project": {
                "date": "$_id",
                "sum": 1,
                "count": 1,
                "_id": 0
            }
        }
    ]).then((revenue) => {
        return res.render('management', { orders, revenue, today: today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), thisMonth })

    })




})

module.exports = router;