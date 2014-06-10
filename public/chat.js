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
    
    


    socket.on('userlist', function (data){   
       
        users_1.forEach(function(usr) {
        removeUser(usr.name);        
        }
        );
        userlist.innerHTML = '';

        var arr = data.userlist;
        arr.forEach(function(entry) {
        users_1.push(entry);
        addUser(entry.name, entry.picture);
        }
        );
     });
     

    socket.on('previousmessages', function (data){    
    $('#myModalHider').modal('hide');

        var arr = data.messages;
        for(var i = 0; i < arr.length; i++) {
        addDatedMessage(arr[i].target, arr[i].name, arr[i].text, arr[i].date, true);
        }
     });

    socket.on('searchresults', function (data){       
        var arr = data.messages;
        for(var i = 0; i < arr.length; i++) {
        addDatedMessage(arr[i].target, arr[i].name, arr[i].text, arr[i].date, true);
        }
        $('#pageTab a[href="#pmSearch"]').tab('show');
     });

    socket.on('userlogout', function (data){
       removeUser(data.nickname);
     });


    socket.on('identifymessage', function (data) {
        if(data.message && data.name) {
            myname = data.name;
            addDatedMessage('home', data.sender, data.message);
        }        
    });

    socket.on('privatemessage', function (data) {
        if(data.message) {
            addDatedMessage(data.person, data.sender, data.message, data.date);
            addNotificationToTab(data.person);
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

         if(field.value == "")return;   

         socket.emit('sendto', { hash: $.cookie("userhash"), message: field.value, target: target});

         field.value = "";
      }


  
    /*
    ********* Returns current date********* 
    */
    function getDateTime(date) {
        var now     = (typeof date !== 'undefined')?new Date(date*1000):new Date(); 
        var year    = now.getFullYear();
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
       
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
        
        var dateTime = '<i class="fa fa-clock-o"></i>' + hour+':'+minute+':'+second;
        if (day !== new Date().getDate() && now.getMonth() !== new Date().getMonth()) 
            dateTime = day + ' ' + months[now.getMonth()] + ' on &nbsp;' + dateTime;

        return dateTime;
    }

    /*
    ********* Adding new user to user panel********* 
    */
    addUser = function(u_name,u_image) {
       

        var userbox =   '<li id = "u_' + u_name + '">';
        userbox +=      '<img src="' + u_image+ '" alt="user image" class="userimage"/>';
        userbox +=      '<span class="text">'+u_name+'</span>';
        userbox +=      '<div class="tools">';
        userbox +=      '<i class="fa fa-edit" onClick=addTab("'+u_name+'",true);></i>';
        userbox +=      '</div>';
        userbox +=      '</li>';

        userlist.innerHTML += userbox;
    
    };


     /*
    ********* Adding new user to user panel********* 
    */
    removeUser = function(u_name) {

        var user_to_remove = document.getElementById('u_'+u_name);
        if(!user_to_remove)
            {
                console.log('Try to remove undefined user: '+u_name);
                return;
            }
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
    ********* Load Previous Messages********* 
    */
    loadPreviousMessages = function(uname) {
        socket.emit('getpreviousmessages', { hash: $.cookie("userhash"), target: uname});
    };


     /*
    ********* Adding new private message to chatpanel********* 
    */

      addDatedMessage = function(u_name, from, message_text, date, before) {

        var uimg = undefined;
        uimg = getImage(from);

        var msg =   '<div class="item">';
        msg +=      ' <img src="'+ uimg +'" alt="user image" class="offline"/>';
        msg +=      '<p class="message">';
        msg +=      '<a href="#" class="name">';
        msg +=      '<small class="text-muted pull-right">';
        msg +=      getDateTime(date);
        msg +=      '</small>';
        msg +=      from;
        msg +=      ' </a>';
        msg +=      message_text;
        msg +=      '</p>';
        msg +=      '</div>';
       
       
        addTab(u_name);             
        
        var _box = document.getElementById('chat-box-'+u_name);

        if(typeof before !== 'undefined' )
        _box.innerHTML = msg + _box.innerHTML;
       else
        _box.innerHTML   +=  msg;

       _box.scrollTop   =   _box.scrollHeight;
    
    };


    doSearch = function()
    {
        if( $('#search-query').val() == '')return false;
        socket.emit('getsearch', { search: $('#search-query').val()}); 
        $('#search-query').val('');
        $('#pageTab li a[href="#pmSearch"] .close').trigger('click');
        return false;
    };
 





  field.onkeyup = keyPressed; 


  /***************************
  *         TABS CONTROL      *
  ***************************/

 /*
    ********* Creating new tab********* 
    */
    addTab = function(userid, by_click)
    {

        if(myname == userid)return;
        if(document.getElementById('chat-box-'+userid))
            {
                console.log('Tab "chat-box-'+userid+'" now found!')
                return;
            }

        pageNum++;
        $('#pageTab').append(
            $('<li><a href="#pm'+userid+'" data-toggle="tab">'+userid+'&nbsp;<span class="label label-success" id="notif-'+userid+'"></span> &nbsp;<button class="close" title="Remove this page" type="button">×</button></a></li>'));
     
       
            var pagehtml = '<div class="tab-pane fade" id="pm'+userid+'">'+
                '<div class="box box-success">'+
                    '<div class="box-header">'+
                       '<h3 class="box-title"><i class="fa fa-comments-o"></i>&nbsp;'+userid+'</h3>'+
                            '<div class="box-tools pull-right" data-toggle="tooltip" title="Status">';
                            if(userid !== 'Search')
                            pagehtml += '<button type="button" class="btn btn-default" id="previous"> <span class="glyphicon glyphicon-backward"></span>&nbsp;Previous</button>';
                            
                            pagehtml += '</div>'+
                            '</div>'+                             
                            '<div class="box-body chat" id="chat-box-'+userid+'">'+ 
                            '</div><!-- /.chat -->'+
                            '</div>'+
                            '</div>';


           $('#pageTabContent').append( pagehtml );
     
       if(typeof by_click !== 'undefined' )
       {
          $('#pageTab a[href="#pm'+userid+'"]').tab('show');
          target = userid;
       }

    }

/*
********* Notification about incoming messages********* 
*/
    addNotificationToTab = function(userid)
    {
 
         if(target == userid)            
                return;
          

         var innerNum = parseInt(document.getElementById('notif-'+userid).innerHTML);
         if(isNaN(innerNum)) innerNum = 0;
         document.getElementById('notif-'+userid).innerHTML = innerNum + 1;
    }



/**
 * Click Tab to show its contents
 */
$("#pageTab").on("click", "a", function(e) {
    e.preventDefault();
    $(this).tab('show');
   
    $(this).children('span').text('');

    if($(this).attr('href') == '#home')target='home';
    else
    target =  $(this).attr('href').substring(3);//$('.nav-tabs .active').attr('id');

    console.log("Location: "+target);
});



/**
* Remove a Tab
*/
$('#pageTab').on('click', ' li a .close', function(e) {
    e.stopPropagation();
    var tabId = $(this).parents('li').children('a').attr('href');
    $(this).parents('li').remove('li');
    $(tabId).remove();

    $('#pageTab a:first').tab('show');
    target = 'home';
    console.log("Closed. Location: "+target);
});
 
/**
* Searchbutton
*/
 $('#search-btn').on('click', function(e) {
    e.preventDefault();
   doSearch();
    
});

/**
* Load Previous Messages
*/
$('#pageTabContent').on('click', 'div div div div #previous', function() {
     loadPreviousMessages(target);
     $('#myModalHider').modal('show');
   
});
 

});

    

