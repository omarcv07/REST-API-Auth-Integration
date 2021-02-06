const path = require('path');
const createError = require('http-errors');
const express = require('express');
const passport = require('passport');
const logger = require('morgan');
const mongoose = require('mongoose')
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/user.js');

const url = process.env.MONGO_URL

mongoose
  .connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true 
  })
  .then(() => {
    console.log("--- DB connected ----");
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch(err => {
    console.log(
        "MongoDB connection error. Please make sure MongoDB is running. " +
            err
    );
  // process.exit();
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

// app.use('first-webpage');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
