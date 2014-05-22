$( document ).ready(function() {
 
    var messages = [];
    var socket = io.connect('http://localhost:3700');

    var userlist = document.getElementById("userlist");
    var sendButton = document.getElementById("send-message-button");
    var addUserButton = document.getElementById("add-user");

    var field = document.getElementById("message-input-form"); 
    var chat_box = document.getElementById("chat-box");   
       

    var content = document.getElementById("content");
    var name = document.getElementById("name");

    var users_1 = [];

    
    var userhash = $.cookie("userhash");


    /*
    ********* Socket.IO handlers ********* 
    */
    
     socket.on('connect', function (){
        console.log('successfully established a working connection ');
        socket.emit('join', { hash: $.cookie("userhash"), message: 'CONNECTED'});

     });
    
    


    socket.on('userjoined', function (data){
       addUser(data.nickname, data.avatar);
       users_1.push({name:data.nickname, picture:data.avatar});
     });

    socket.on('userlist', function (data){       
        var arr = data.userlist;



        arr.forEach(function(entry) {
        users_1.push(entry);
        addUser(entry.name, entry.picture);
        }
        );
     });
     

    socket.on('userlogout', function (data){
       removeUser(data.nickname);
     });

    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            addMessage(data.sender, data.message);
        }
        
    });
    

    /*
    ********* Function KeyPress********* 
    */
    keyPressed = function(e) {
        if(e.keyCode == 13) {

           sendMessage();
        }     
    };


    /*
    ********* On AddUser button clicked ********* 
    */
    addUserButton.onclick = function() {       
        addUser("Vasia98");     

    };



    /*
    ********* On Send button clicked********* 
    */
    sendButton.onclick = function() {
       sendMessage();
    };


    /*
    ********* Send message function********* 
    */
    sendMessage = function() {
         //addMessage("Vasia", field.value);   

         socket.emit('send', { hash: $.cookie("userhash"), message: field.value});

         field.value = "";
      }


  
    /*
    ********* Returns current date********* 
    */
    function getDateTime() {
        var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
        if(month.toString().length == 1) {
            var month = '0'+month;
        }
        if(day.toString().length == 1) {
            var day = '0'+day;
        }   
        if(hour.toString().length == 1) {
            var hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            var minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            var second = '0'+second;
        }   
        var dateTime = hour+':'+minute+':'+second;   
        return dateTime;
    }

    /*
    ********* Adding new user to user panel********* 
    */
    addUser = function(u_name,u_image) {
       

        var userbox =   '<li id = "' + u_name + '">';
        userbox +=      '<img src="' + u_image+ '" alt="user image" class="userimage"/>';
        userbox +=      '<span class="text">'+u_name+'</span>';
        userbox +=      '<div class="tools">';
        userbox +=      '<i class="fa fa-edit"></i>';
        userbox +=      '<i class="fa fa-trash-o"></i>';
        userbox +=      '</div>';
        userbox +=      '</li>';

        userlist.innerHTML += userbox;
    
    };


     /*
    ********* Adding new user to user panel********* 
    */
    removeUser = function(u_name) {

        var user_to_remove = document.getElementById(u_name);
        user_to_remove.parentNode.removeChild(user_to_remove);

        var elem = undefined;
        users_1.forEach(function(entry) {
             if(entry.name == u_name)elem = entry;
        });
        var index = users_1.indexOf(elem);
        if (index > -1) {
           users_1.splice(index, 1);
            }
    
    };

     /*
    ********* Get image by username********* 
    */
    getImage = function(u_name) {

      var pict = undefined;
      users_1.forEach(function(entry) {

             if(entry.name == u_name)pict = entry.picture;
        });

      if(pict)
      return pict;
        else
        return 'img/avatar3.png';    
    };

    /*
    ********* Adding new message to chatpanel********* 
    */
     addMessage = function(u_name, message_text) {

        var uimg = undefined;
        uimg = getImage(u_name);

        var msg =   '<div class="item">';
        msg +=      ' <img src="'+ uimg +'" alt="user image" class="offline"/>';
        msg +=      '<p class="message">';
        msg +=      '<a href="#" class="name">';
        msg +=      '<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> ';
        msg +=      getDateTime();
        msg +=      '</small>';
        msg +=      u_name;
        msg +=      ' </a>';
        msg +=      message_text;
        msg +=      '</p>';
        msg +=      '</div>';

       chat_box.innerHTML   +=  msg;
       chat_box.scrollTop   =   chat_box.scrollHeight;
    
    };


  field.onkeyup = keyPressed; 
 
});

    

