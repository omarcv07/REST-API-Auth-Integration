const express = require('express');
const { verifyAdmin, verifyUser } = require('../passport/index.js');

const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', function(req, res, next) {
  console.log(req.body)
  res.render('index', { title: 'Express' });
});

indexRouter.get('/home', verifyUser, function(req, res, next) {
  res.render('index', { title: 'Home Website' });
});
    
indexRouter.get('/admin', verifyUser, verifyAdmin, function(req, res, next) {
  res.render('index', { title: 'Admin Website' });
});

module.exports = indexRouter;