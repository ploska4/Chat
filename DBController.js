var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',//zaq123456',
  database : 'test'
});

connection.connect(function(err) {
 if(err)console.log(err);
});


function createUser(_name, _email, _password, callback) {
 	var user  = {name: _name, password: _password, email:_email};
	var query = connection.query('INSERT INTO users SET ?', user, function(err, result) {
		 if (err) throw err;
		 else
		  console.log('Inserted ID: '+result.insertId);
		 callback.redirect('/login');
  // Neat!
});
console.log(query.sql);
}

exports.createUser = createUser;