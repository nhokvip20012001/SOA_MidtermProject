var express = require('express');
var router = express.Router();
var Dish = require('../models/DishModel')
var Cart = require('../models/CartModel')
var Order = require('../models/OrderModel')

router.get('/toggle-menu', async (req, res) => {
    const burgers = await Dish.find({ category: 'Burger' }).lean().exec()
    const pastas = await Dish.find({ category: 'Pasta' }).lean().exec()
    const pizzas = await Dish.find({ category: 'Pizza' }).lean().exec()
    const chickens = await Dish.find({ category: 'Chicken' }).lean().exec()
    const drinks = await Dish.find({ category: 'Drinks' }).lean().exec()
    console.log(req.session)
    res.render('toggle-menu', { burgers, pastas, pizzas, chickens, drinks })
})

router.get('/turn-off-item/:id', async (req, res) => {
    var dishID = req.params.id
    var order = await Dish.findOneAndUpdate({
        _id: dishID
    },
        {
            status: 'Off'
        })
    order.save()
        .then(() => {
            res.redirect('back')
        })
})

router.get('/turn-on-item/:id', async (req, res) => {
    var dishID = req.params.id
    var order = await Dish.findOneAndUpdate({
        _id: dishID
    },
        {
            status: null
        })
    order.save()
        .then(() => {
            res.redirect('back')
        })
})

router.get('/mark-done/:id', async (req, res) => {
    var dishID = req.params.id
    var cart = new Cart(req.session.cart ? req.session.cart : {})

    cart.changeStatus(dishID, 'Done')
    req.session.cart = cart;
    console.log(req.session.cart)
    res.redirect('back')
})

module.exports = router;