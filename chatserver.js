var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var swig = require('swig');
var DB = require('./DBController');
var crypto = require('crypto');

app.use(express.static(__dirname + '/public'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/public');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.get('/', function (req, res) {
  res.render('index', { /* template locals context */ });
});

app.get('/login', function (req, res) {
  res.render('login', { /* template locals context */ });
});

app.get('/register', function (req, res) {
  res.render('register', { title:"Create Account" });
});

app.post('/register', function (req, res) {
	   var name    	= req.body.login;
     var email  	= req.body.email;
     var pwd      = req.body.password;

  DB.createUser(name,email,pwd,res);
  
});


//app.use('/static', express.static(__dirname + '/static'));


/*
************** New connection handler *************
*/
io.sockets.on('connection', function (socket) {

    socket.emit('message', { message: 'Welcome to the chat, new user!' });

    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});



/*
*************** Starting server ****************
*/

server.listen(3700);
console.log('Server started at port 37000');