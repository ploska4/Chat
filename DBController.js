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


function createUser(_name, _email, _password, _hash, imagename, callback) {
 	var user  = {name: _name, password: _password, email:_email, hash:_hash, picture:imagename};
	var query = connection.query('INSERT INTO users SET ?', user, function(err, result) {
		 if (err) throw err;
		 else
		 console.log('Inserted ID: '+result.insertId);
		 callback.redirect('/login');

});
console.log(query.sql);
}

function saveMessage(sender, receiver, text, date) {

	var receiver_query = (receiver == 0 || receiver == 'home')? '?' : '(SELECT id FROM users WHERE name = ? LIMIT 1)'; 
	var query = connection.query('INSERT INTO messages (sender_id, receiver_id, text, date) VALUES ( (SELECT id FROM users WHERE name = ? LIMIT 1), '+ receiver_query +', ?, ?)', [sender, receiver, text, date], function(err, result) {
	 if (err) throw err;
		 else
		 console.log('Inserted ID: '+result.insertId);		
 
});
console.log(query.sql);
}

exports.saveMessage = saveMessage;
exports.createUser = createUser;
exports.connection = connection;