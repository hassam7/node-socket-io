 var socket = io();

 function scrollToBottom() {
     // Selectors
     var messages = jQuery('#messages');
     var newMessage = messages.children('li:last-child')
     // Heights
     var clientHeight = messages.prop('clientHeight');
     var scrollTop = messages.prop('scrollTop');
     var scrollHeight = messages.prop('scrollHeight');
     var newMessageHeight = newMessage.innerHeight();
     var lastMessageHeight = newMessage.prev().innerHeight();

     if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
         messages.scrollTop(scrollHeight);
     }
 }

 socket.on('connect', function () {
     console.log("Connected to server");
     var params = $.deparam(window.location.search);
    //  params.room = params.room.toLowerCase();
     console.log(params)
     
     socket.emit("join", params, function (err) {
         if (err) {
             alert("Invalid name or room")
             window.location.href = '/'
         } else {

         }
     });
 });
 socket.on('disconnect', function () {
     console.log("Disconnected to server");
 });

 socket.on("updateUserList", function (users) {
     console.log("Inside UpdateUserList Client Side", users)
     var ol = $('<ol></ol>');
     users.forEach(function (user) {
         ol.append($('<li></li>').text(user));
     }, this);
     $('#users').html(ol);
 });
 socket.on('newMessage', function (data) {
     var template = $('#message-template').html();
     var formattedTime = moment(data.createdAt).format('h:mm a');
     var html = Mustache.render(template, {
         text: data.text,
         from: data.from,
         createdAt: formattedTime
     });

     $('#messages').append(html);
     scrollToBottom()
     //  console.log("New Message", JSON.stringify(data));
     //  var li = $('<li></li>');
     //  li.text(`${data.from} ${formattedTime}: ${data.text}`);

     //  jQuery('#messages').append(li);

 });

 socket.on('newLocationMessage', function (message) {
     var formattedTime = moment(message.createdAt).format('h:mm a');
     var template = $('#location-message-template').html();
     var html = Mustache.render(template, {
         text: message.text,
         from: message.from,
         createdAt: formattedTime,
         url: message.url
     });

     $('#messages').append(html);
     scrollToBottom()
     //  var li = $('<li></li>');
     //  var a = $('<a target="_blank">My Current Location</a>')
     //  li.text(`${message.from} ${formattedTime}: `);
     //  a.attr('href', message.url)
     //  li.append(a);
     //  $("#messages").append(li);
 });

 jQuery('#message-form').on('submit', function (e) {
     socket.emit('createMessage', {
         text: $('[name=message]').val()
     }, function (response) {
         $('[name=message]').val("");
     })



     e.preventDefault();

 });

 var locationBtn = $('#send-location');
 locationBtn.on('click', function () {
     if (!navigator.geolocation) {
         return alert("Geolocation not supported");
     }
     locationBtn.attr("disabled", "disabled").text("Sending Location....");
     navigator.geolocation.getCurrentPosition(function (position) {
         locationBtn.removeAttr("disabled").text("Send Location");

         socket.emit('createLocationMessage', {
             latitude: position.coords.latitude,
             longitude: position.coords.longitude,

         });
     }, function () {
         locationBtn.removeAttr("disabled").text("Send Location");;
         alert('Unable to Fetch Location');
     });
 });
 /*
 // sending to sender-client only
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
socket.broadcast.to(socketid).emit('message', 'for your eyes only');
*/