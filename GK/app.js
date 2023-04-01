console.clear()
var express = require('express');
var Handlebars = require('handlebars');
const hdb = require('express-handlebars')
const session = require('express-session')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash')
var MongoStore = require('connect-mongo')(session);
const port = 8081
//Routing
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chefRouter = require('./routes/chef');
var managerRouter = require('./routes/manager');

var app = express();
//Connect database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Midterm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4
})
  .then(() => console.log('MongoDB connected!'))
  .catch(e => console.log('Cannot connect to database: ' + e.message));
mongoose.Promise = global.Promise;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.engine('handlebars', hdb.engine({
  defaultLayout: 'main'
}))
Handlebars.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});
Handlebars.registerHelper('eq', function(a, b) {
  return (a === b);
});
Handlebars.registerHelper('getDateTime', function(date) {
  return date.toLocaleString()
});
app.use(session({
  secret: 'midtermSOA',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));
app.use(flash())

// session
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/chef', chefRouter);
app.use('/manager', managerRouter);


// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.listen(port, () => console.log('Server is online at port ' + port))
module.exports = app;
