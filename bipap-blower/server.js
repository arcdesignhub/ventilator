// Required modules
var express = require('express');                                      // Express 
var app = express();
var handlebars = require('express-handlebars').create({
  defaultLayout:'main'
});  // Handlebars template engine

// Set up express to use handlebars and appropriate PORT
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 9050);

// Set public folder
app.use(express.static('public'));

// Root
app.get('/',function(req,res,next){
    let context = {};
    res.render('index', context);
});

// 404 Page Not Found Error
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

// 500 Server Error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

// Start the app
app.listen(app.get('port'), function(){
  console.log('Express started; press Ctrl-C to terminate.');
});