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
var multipart = require('connect-multiparty');
var path = require('path');
var fs = require('fs');
var validator = require('validator');

var multipartMiddleware = multipart({ uploadDir: __dirname + '/uploads' });



//app.use(express.json());       // to support JSON-encoded bodies
//app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(bodyParser());
app.use(cookieParser('secret-key-1199234'));
app.use(session());



app.use(express.static(__dirname + '/public', { maxAge: 86400000 }));



app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/public');
app.set('view cache', false);
swig.setDefaults({ cache: false });


app.get('/', checkAuth, function (req, res) {
  res.render('index-chat', { username :  req.session.user_name, userimage: req.cookies.userimage});
});

app.get('/login', function (req, res) { 
 res.render('login', { });
});

app.get('/login/error', function (req, res) { 
  res.render('login', { alert : '  <div class="alert alert-danger"><b>User name or password is incorrect</b></div>'});
});

app.post('/login/error', function (req, res) { 
  res.render('login', { alert : '  <div class="alert alert-danger"><b>User name or password is incorrect</b></div>'});
});

app.get('/secret', checkAuth, function (req, res) {
  res.send('Auth OK');  
});

app.get('/register', function (req, res) {
  res.render('register', { title:"Create Account" });
});

app.get('/register/error/:id', function (req, res) { 

var errmessage = ''; 
switch(req.params.id)
{
  case '1':
  errmessage =  '<div class="alert alert-danger"><b>Please specify correct login and password</b></div>';
  break;

 case '2':
  errmessage =  '<div class="alert alert-danger"><b>User with this login now exists. Please select other login and try again</b></div>';
  break;

  case '3':
  errmessage =  '<div class="alert alert-danger"><b>No image selected or wrong image format. Use only [jpg], [gif], [png] images</b></div>';
  break;
}
  res.render('register', { title:"Create Account", alert : errmessage });
});



app.post('/register', multipartMiddleware, function (req, res) {
  var name    = req.body.login;
  var email  	= req.body.email;
  var pwd     = req.body.password;
  var _hash   = getMD5('secret-'+name+'-'+pwd);

  var _error = '';


 var userimage = req.files.imagemy;
 var tempPath = userimage.path;

 // if wrong name / password entered
  if(name == '' || pwd == '')
  {
     fs.unlink(tempPath, function (err) {
            if (err) throw err;
            console.error("Wrong data, image was removed");
            _error = '1';
            res.redirect('/register/error/'+_error);
            console.log(1111111111);
        });    
  }

  else
  {
    var ext = path.extname(req.files.imagemy.originalFilename).toLowerCase();
    var targetPath = path.resolve('./public/avatars/avatar_' + name + ext);

    //checkin if iser exists
    var query = DB.connection.query('SELECT * FROM users WHERE name = ?', [name], function(err, rows, fields) {
      if (err) throw err;

      if (rows[0]) {
        fs.unlink(tempPath, function (err) {
            if (err) throw err;
            console.error("Wrong data, image was removed");
            _error = '2';
            res.redirect('/register/error/'+_error);
           console.log(2222222222);
        });    
       

      } else {
        //checking image
        if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
          fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload completed!");
            DB.createUser(name,email,pwd,_hash,'avatar_'+name+ext,res);
          });
        } else {
          fs.unlink(tempPath, function(err) {
            if (err) throw err;
            console.error("Only image files are allowed!");
            _error = '3';
            res.redirect('/register/error/'+_error);

          });
        }

      }

    });

  }
 
});


app.post('/login', function (req, res) {
  var query = DB.connection.query('SELECT * FROM users WHERE name = ? AND password = ?', [req.body.login,  req.body.password], function(err, rows, fields) {
    if (err) throw err;

    if (rows[0]) {
     req.session.user_id    = rows[0].id;
     req.session.user_hash  = rows[0].hash;
     req.session.user_name  = rows[0].name;

      var uavatar = rows[0].picture;
      if(uavatar == undefined) uavatar = 'img/avatar3.png';
      else
        uavatar = 'avatars/'+uavatar;

     res.cookie('userimage', uavatar, { });
     res.cookie('userhash', req.session.user_hash, { });
     

     res.redirect('/');
   } else {
     res.redirect('/login/error');
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
  delete req.session.user_name;
  res.clearCookie('userhash', { });
  res.clearCookie('userimage', { });
  res.redirect('/login');
});  



/*
*************** Checking Authorization ************** 
*/
function checkAuth(req, res, next) {    

  if (!req.session.user_id || !req.session.user_hash || !req.session.user_name) {   
   res.redirect('/login');
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

     //User joined to chat
    socket.on('join', function(data) {       

        var query = DB.connection.query('SELECT * FROM users WHERE hash = ?', [data.hash], function(err, rows, fields) {
        if (err) throw err;

        if (rows[0]) {
          var uname = rows[0].name;
          var uavatar = rows[0].picture;
          if(uavatar == undefined) uavatar = 'img/avatar3.png';
          else
          uavatar = 'avatars/'+uavatar;
           
         socket.set('nickname', uname, function () {
         socket.set('picture', uavatar, function () {
         socket.emit('message', { sender : "Server",  message: 'Welcome to the chat, <b>'+uname+'</b>!' });
         socket.broadcast.emit('userjoined', {nickname: uname, avatar:uavatar});
         socket.broadcast.emit('message', {sender: 'Server', message: 'User <b>'+uname+'</b> joined to chat.'});

        //Sending to user info about other users
         var clients = io.sockets.clients();
         var arr = [];
         clients.forEach(function(entry) {
          entry.get('nickname', function (err, name) {
              if(err)
                console.log('No-name user');
              else
                {      


                entry.get('picture', function (err, pict) {
              if(err)
                console.log('No picture for user' + name);
              else
                { 
                 arr.push({name:name, picture:pict});
                }
               });

                }
               });
            });

         socket.emit('userlist', {userlist: arr});

          });
         });
        } else {
          socket.emit('message', { sender : "Server",  message: 'Error: Bad authorization ...' });
          }      
      }); 
     
    });

    //User disconnected
    socket.on('disconnect', function() {
     socket.get('nickname', function (err, name) {
          if(err)
            console.log('Invalid user disconnected');
          else
           { 
         io.sockets.emit('userlogout', {nickname: name});
         socket.broadcast.emit('message', {sender: 'Server', message: 'User <b>'+name+'</b> has been disconnected from server.'});
       }
    });
    });

    //Message received

      socket.on('send', function (data) {
        socket.get('nickname', function (err, name) {
          if(err)
            console.log('Invalid user');
          else
         io.sockets.emit('message', {sender: name, message: validator.escape(data.message)});
    });
     
    });

  });





/*
*************** Starting server ****************
*/

server.listen(3700);
console.log('Server started at port 37000');

