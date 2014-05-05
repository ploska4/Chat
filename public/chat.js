window.onload = function() {
 
    var messages = [];
    var socket = io.connect('http://localhost:3700');

    var userlist = document.getElementById("userlist");
    var sendButton = document.getElementById("send-message-button");
    var addUserButton = document.getElementById("add-user");

    var field = document.getElementById("message-input-form"); 
    var chat_box = document.getElementById("chat-box");   
       

    var content = document.getElementById("content");
    var name = document.getElementById("name");

    
     
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            addMessage('Server', data.message);
        }
        else
        addMessage('Server','No data received');    
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
         socket.emit('send', { message: field.value});

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
    addUser = function(u_name) {

        var userbox =   '<li>';
        userbox +=      '<small class="label label-success"><i class="fa fa-clock-o"></i></small>';
        userbox +=      '<span class="text">'+u_name+'</span>';
        userbox +=      '<div class="tools">';
        userbox +=      '<i class="fa fa-edit"></i>';
        userbox +=      '<i class="fa fa-trash-o"></i>';
        userbox +=      '</div>';
        userbox +=      '</li>';

        userlist.innerHTML += userbox;
    
    };

    /*
    ********* Adding new message to chatpanel********* 
    */
     addMessage = function(u_name, message_text) {
        var msg =   '<div class="item">';
        msg +=      ' <img src="img/avatar3.png" alt="user image" class="offline"/>';
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

       chat_box.innerHTML += msg;
       chat_box.scrollTop = chat_box.scrollHeight;
    
    };


  field.onkeyup = keyPressed; 
 
}

