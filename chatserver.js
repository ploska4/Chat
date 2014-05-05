var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var swig = require('swig');
var DB = require('./DBController');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');


app.use(express.static(__dirname + '/public'));
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(bodyParser());
app.use(cookieParser('secret-key-1199234'));
app.use(session());

app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/public');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.get('/', checkAuth, function (req, res) {
  res.render('index-chat', { /* template locals context */ });
});

app.get('/login', function (req, res) {
  res.render('login', { /* template locals context */ });
});

app.get('/register', function (req, res) {
  res.render('register', { title:"Create Account" });
});

app.get('/secret', checkAuth, function (req, res) {
  res.send('Auth OK');  
});


app.post('/register', function (req, res) {
	   var name    	= req.body.login;
     var email  	= req.body.email;
     var pwd      = req.body.password;
     var _hash = getMD5('secret-'+name+'-'+pwd);

  DB.createUser(name,email,pwd,_hash,res);
  
});

app.post('/login', function (req, res) {


    var query = DB.connection.query('SELECT * FROM users WHERE name = ? AND password = ?', [req.body.login,  req.body.password], function(err, rows, fields) {
        if (err) throw err;

        if (rows[0]) {
             req.session.user_id    = rows[0].id;
             req.session.user_hash  = rows[0].hash;
             res.redirect('/');
         } else {
             res.send('Error login');
        }

        console.log(rows);
       
    });  
    console.log(query.sql);
});

/*
*************** Logout ************** 
*/
app.get('/logout', function (req, res) {
  delete req.session.user_id;
  delete req.session.user_hash;
  res.redirect('/login');
});  



/*
*************** Checking Authorization ************** 
*/
function checkAuth(req, res, next) {    

  if (!req.session.user_id || !req.session.user_hash) {   
    res.send('You are not authorized to view this page');
  } else {

      var query = DB.connection.query('SELECT * FROM users WHERE id = ? AND hash = ?', [req.session.user_id,  req.session.user_hash], function(err, rows, fields) {
        if (err) throw err;

        if (rows[0]) {
              next();
         } else {
             res.send('Error auth');
        }
       
    }); 
      console.log(query.sql);

     
  }
}


/*
*************** get MD5 Hash  ************** 
*/
function getMD5(data) {
return crypto.createHash('md5').update(data).digest('hex');
}


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