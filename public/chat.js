$( document ).ready(function() {
 
    var messages = [];
    var socket = io.connect('http://localhost:3700');

    var userlist = document.getElementById("userlist");
    var sendButton = document.getElementById("send-message-button");
    var addUserButton = document.getElementById("add-user");

    var field = document.getElementById("message-input-form"); 
    var chat_box = document.getElementById("chat-box");   

    var myname = undefined;       

    var content = document.getElementById("content");
    var name = document.getElementById("name");

    var users_1 = [];

    
    var userhash = $.cookie("userhash");

    var pageNum = 1;

    var target = 'home';


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

     socket.on('identifymessage', function (data) {
        if(data.message && data.name) {
            myname = data.name;
            addMessage(data.sender, data.message);
        }        
    });

    socket.on('privatemessage', function (data) {
        if(data.message) {
            addPrivateMessage(data.sender, data.sender, data.message);
        }
        
    });

    socket.on('privatemessagerespond', function (data) {
        if(data.message) {
            addPrivateMessage(data.person, data.sender, data.message);
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
         if(field.value == "")return;   

         if(target == 'home')
            socket.emit('send', { hash: $.cookie("userhash"), message: field.value});
         else 
            socket.emit('sendto', { hash: $.cookie("userhash"), message: field.value, target: target});

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
        userbox +=      '<i class="fa fa-edit" onClick=addTab("'+u_name+'");></i>';
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

     /*
    ********* Adding new private message to chatpanel********* 
    */
     addPrivateMessage = function(u_name, from, message_text) {

        var uimg = undefined;
        uimg = getImage(from);

        var msg =   '<div class="item">';
        msg +=      ' <img src="'+ uimg +'" alt="user image" class="offline"/>';
        msg +=      '<p class="message">';
        msg +=      '<a href="#" class="name">';
        msg +=      '<small class="text-muted pull-right"><i class="fa fa-clock-o"></i> ';
        msg +=      getDateTime();
        msg +=      '</small>';
        msg +=      from;
        msg +=      ' </a>';
        msg +=      message_text;
        msg +=      '</p>';
        msg +=      '</div>';

       
       
        addTab(u_name);             
        
        var _box = document.getElementById('chat-box-'+u_name);

       _box.innerHTML   +=  msg;
       _box.scrollTop   =   _box.scrollHeight;
    
    };



   

   /*
    ********* Creating new tab to chat with selected user********* 
   */
   /*
    $('#userlist').on('click', ' li div .fa-edit', function() {
       addTab();
    });
    */






  field.onkeyup = keyPressed; 


  /***************************
  *         TABS CONTROL      *
  ***************************/

 /*
    ********* Creating new tab********* 
    */
    addTab = function(userid)
    {

        if(myname == userid)return;
        if(document.getElementById('chat-box-'+userid))return;

        pageNum++;
        $('#pageTab').append(
            $('<li><a href="#pm'+userid+'" data-toggle="tab">'+userid+'&nbsp;<button class="close" title="Remove this page" type="button">×</button></a></li>'));
     
        $('#pageTabContent').append(
            '<div class="tab-pane fade" id="pm'+userid+'">'+
                '<div class="box box-success">'+
                    '<div class="box-header">'+
                       '<h3 class="box-title"><i class="fa fa-comments-o"></i>&nbsp;'+userid+'</h3>'+
                            '<div class="box-tools pull-right" data-toggle="tooltip" title="Status">'+
                          
                            '</div>'+
                            '</div>'+
                             
                            '<div class="box-body chat" id="chat-box-'+userid+'">'+                            


                            '</div><!-- /.chat -->'+
                            '</div>'

            +'</div>');
     
       // $('#' + userid).tab('show');
    }

/**
* Remove a Tab
*/
$('#pageTab').on('click', ' li a .close', function() {
    var tabId = $(this).parents('li').children('a').attr('href');
    $(this).parents('li').remove('li');
    $(tabId).remove();

    $('#pageTab a:first').tab('show');
});
 
/**
 * Click Tab to show its contents
 */
$("#pageTab").on("click", "a", function(e) {
    e.preventDefault();
    $(this).tab('show');

    if($(this).attr('href') == '#home')target='home';
    else
    target =  $(this).attr('href').substring(3);//$('.nav-tabs .active').attr('id');

    console.log("Location: "+target);
});
 

});

    

