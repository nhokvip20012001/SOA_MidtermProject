var express = require('express');
var router = express.Router();
var Dish = require('../models/DishModel')
var Cart = require('../models/CartModel')
var Order = require('../models/OrderModel');
const session = require('express-session');
/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});
router.get('/menu', async (req, res) => {
  const burgers = await Dish.find({ category: 'Burger' }).lean().exec()
  const pastas = await Dish.find({ category: 'Pasta' }).lean().exec()
  const pizzas = await Dish.find({ category: 'Pizza' }).lean().exec()
  const chickens = await Dish.find({ category: 'Chicken' }).lean().exec()
  const drinks = await Dish.find({ category: 'Drinks' }).lean().exec()

  res.render('menu', { burgers, pastas, pizzas, chickens, drinks })
})
router.get('/menu/:id', async (req, res) => {
  const burgers = await Dish.find({ category: 'Burger' }).lean().exec()
  const pastas = await Dish.find({ category: 'Pasta' }).lean().exec()
  const pizzas = await Dish.find({ category: 'Pizza' }).lean().exec()
  const chickens = await Dish.find({ category: 'Chicken' }).lean().exec()
  const drinks = await Dish.find({ category: 'Drinks' }).lean().exec()

  var orderID = req.params.id
  if (!req.session.cart) {
    return res.render('menu', { burgers, pastas, pizzas, chickens, drinks, orderID, items: null })
  }
  var cart = new Cart(req.session.cart)
  return res.render('menu', { burgers, pastas, pizzas, chickens, drinks, orderID, items: cart.generateArray(), totalPrice: cart.totalPrice.toFixed(2), totalQty: cart.totalQty })
})

router.get('/order', async (req, res) => {
  var now = new Date()
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  today = today.toLocaleDateString(undefined, options)
  var orders = await Order.find({ checkin: { $gte: today } }).sort('-checkin').lean().exec()
  return res.render('order', { orders, today})
})

router.get('/order/:id', async (req, res) => {
  var oid = req.params.id
  var cart = new Cart(req.session.cart ? req.session.cart : {})
  await Order.findById(oid).exec()
    .then((order) => {
      console.log(cart)
      if (order.status == 'Completed') return res.render('detail', { order })
      else return res.render('processingOrder', { order, items: cart.generateArray() })
    })
    .catch((error) => {
      console.error(error);
    });
})

router.post('/order', async (req, res) => {
  var currentTable = parseInt(req.body.table)
  if(!req.session.tableUsed){
    req.session.tableUsed = []
  }
  var order = new Order({
    table: req.body.table
  })
  if (!req.session.tableUsed.includes(currentTable)) {
    order.save()
      .then(() => {
        req.session.tableUsed.push(currentTable)
        console.log(req.session.tableUsed)
        res.redirect('/order')
      })
  }
  else {
    console.log('Table is not available!')
    res.redirect('/order')
  }
})
router.get('/add-item/:id', async (req, res) => {
  var dishID = req.params.id
  var cart = new Cart(req.session.cart ? req.session.cart : {})

  await Dish.findById(dishID).exec()
    .then((dish) => {
      cart.add(dish, dish.id);
      req.session.cart = cart;
      console.log(req.session.cart)
      res.redirect('back')
    }).catch((error) => {
      console.error(error);
    });
})

router.get('/delete-item/:id', async (req, res) => {
  var dishID = req.params.id
  var cart = new Cart(req.session.cart ? req.session.cart : {})

  cart.delete(dishID)
  req.session.cart = cart;
  res.redirect('back')
})

router.post('/payment/:id', async (req, res) => {
  var oid = req.params.id
  if (!req.session.cart) {
    return res.redirect('/')
  }
  var cart = new Cart(req.session.cart)
  var order = await Order.findOneAndUpdate({
    _id: oid
  },
    {
      cart: cart,
      checkout: new Date(),
      status: 'Completed'
    })
  order.save()
    .then((result) => {
      req.session.cart = null
      const index = req.session.tableUsed.indexOf(result.table);
      if (index > -1) {
        req.session.tableUsed.splice(index, 1);
      }
      console.log(req.session.tableUsed)
      res.redirect('/order')
    })
});

module.exports = router;
