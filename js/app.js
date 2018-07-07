// Initialize Firebase
var config = {
    apiKey: "AIzaSyAIKVjuaufdDqA9mECYn_VqHzApOdCmagc",
    authDomain: "webrtc-19097.firebaseapp.com",
    databaseURL: "https://webrtc-19097.firebaseio.com",
    projectId: "webrtc-19097",
    storageBucket: "webrtc-19097.appspot.com",
    messagingSenderId: "122476759721"
};

var room;
var pc, pc2 = '', pc3 = '';
var configuration;
var drone;
var roomId;

firebase.initializeApp(config);

const dbRef = firebase.database().ref();

console.log("hallo");

function logoout(){
    if (typeof(Storage) !== "undefined") {
        localStorage.removeItem("username");
        localStorage.removeItem("id");
        localStorage.removeItem("image");
        localStorage.removeItem("email");
        window.location.href = "login.html";
    } else {
        alert('Sorry, your browser does not support Web Storage...')
    }
}

function checklogin(){
    if (typeof(Storage) !== "undefined") {
        if (localStorage.getItem("username") != null) {
            window.location.href = "dashboard.html";
        }
    } else {
        alert('Sorry, your browser does not support Web Storage...')
    }
}

function dashboard(){
    if (typeof(Storage) !== "undefined") {
        // document.getElementById("usernameDB").innerHTML = "asu";
        if (localStorage.getItem("username") != null) {
            window.onload = function(){
              document.getElementById("usernameDB").innerHTML = localStorage.getItem("username");
            }
        }else {
            window.location.href = "login.html";
        }
    } else {
        alert('Sorry, your browser does not support Web Storage...')
    }

}


function rejectCall(){
    location.hash = '';
    pc.close();
    if (pc2 != '') {
        pc2.close();
    }
    if (pc3 != '') {
        pc3.close();
    }
    room.unsubscribe();
    deleteRoomName();
    $("#room2").modal("hide");
    $("#room3").modal("hide");
    $("#room4").modal("hide");
}

function createRoom(){
    var roomName = document.getElementById("roomName").value;
    var roomCapacity = document.getElementById("roomCapacity").value;

    if (roomCapacity > 1 && roomCapacity < 3 && roomName != '') {

        $("#create-room-item").find("input[name='roomName']").val('');
        $("#create-room-item").find("input[name='roomCapacity']").val('');
        $(".modal").modal("hide");

        if (roomCapacity == 2) {
            checkRoom("#room2", roomCapacity, roomName);
        }

    }else {
        alert('Please check room name and capacity.')
    }
}

function searchRoom(){
    var roomName = document.getElementById("roomNameSearch").value;
    if (roomName != '') {
        $(".modal").modal("hide");
        console.log(roomName);
        searchRoomName(roomName);
    }else {
        alert('Please check room name.')
    }
}

function deleteRoomName(){
    var roomName = localStorage.getItem("roomName");
    var userRoomID = localStorage.getItem("userRoomID");
    console.log(roomName);
    console.log(userRoomID);
    var userRef = dbRef.child('room').child(roomName).child('user');
    var readUser = userRef.once('value', function(data){
        if (data.numChildren() > 1) {
            //delete user
            userRef.child(userRoomID).remove();
        }else {
            //delete room
            userRef.child(userRoomID).remove();
            dbRef.child('room').child(roomName).remove();
        }
        localStorage.removeItem("roomName");
        localStorage.removeItem("userRoomID");
    });
}

function displayRoomProfile(){
    // window.onload = function(){
        var roomName = localStorage.getItem("roomName");
        var roomRef = dbRef.child('room').child(roomName);
        var readRoom = roomRef.on('value', function(data){
            var userRef = roomRef.child('user');
            var readuser = userRef.once('value', function(dataUser){
                document.getElementById("txtRoomName").innerHTML = data.val().nameRoom;
                document.getElementById("txtRoomCapacity").innerHTML = "Online : " + dataUser.numChildren() + " of " + data.val().capacityRoom;
            });
        });
        document.getElementById("usernameDB").innerHTML = localStorage.getItem("username");
    // }
}

function searchRoomName(roomName){
    var storesRef = dbRef.child('room').child(roomName);
    var readStore = storesRef.once('value', function(dataParent) {
        if (dataParent.numChildren() != 0) {
            var userRef = storesRef.child("user");
            var getUser = userRef.once('value', function(data){
                if (parseInt(dataParent.val().capacityRoom) > data.numChildren()) {
                    var userEmail = localStorage.getItem("email");
                    var userName = localStorage.getItem("username");
                    var userId = localStorage.getItem("id");
                    var newStoreRef = userRef.push();
                    var key = newStoreRef.key;
                    newStoreRef.set({
                        "key ": key,
                        "userName": userName,
                        "email": userEmail,
                    });
                    if (typeof(Storage) !== "undefined") {
                        console.log(roomName);
                        localStorage.setItem("roomName", roomName);
                        localStorage.setItem("userRoomID", key);
                    } else {
                        alert('Sorry, your browser does not support Web Storage...')
                    }
                    setDisplay(getRoomId(parseInt(dataParent.val().capacityRoom)), parseInt(dataParent.val().capacityRoom), roomName);
                }else {
                    alert('Room is full.')
                }
            });
        }else {
            alert('Room not found.')
        }
    });
}

function getRoomId(size){
    return "#room" + size;
}

function checkRoom(id, size, name){
    var nameRoom = name;
    var storesRef = dbRef.child('room');
    var readStore = storesRef.once('value', function(data) {
        // updateStarCount(postElement, snapshot.val());
        var bol = true;
        data.forEach(function(child) {
            var user = child.val();
            if (user.nameRoom == nameRoom) {
                bol = false;
            }
        });
        if (bol) {
            var userEmail = localStorage.getItem("email");
            var userName = localStorage.getItem("username");
            var userId = localStorage.getItem("id");
            console.log(userEmail);
            console.log(userName);
            console.log(nameRoom);
            var rootRoom = storesRef.child(nameRoom);
            rootRoom.set({
                "nameRoom" : nameRoom,
                "capacityRoom" : size,
                "user" : null,
            });
            var userEmail = localStorage.getItem("email");
            var userName = localStorage.getItem("username");
            var userId = localStorage.getItem("id");
            var newStoreRef = storesRef.child(nameRoom).child("user").push();
            var key = newStoreRef.key;
            newStoreRef.set({
                "key ": key,
                "userName": userName,
                "email": userEmail,
            });
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("roomName", nameRoom);
                localStorage.setItem("userRoomID", key);
            } else {
                alert('Sorry, your browser does not support Web Storage...')
            }
            setDisplay(id, parseInt(size), name);
            alert('Create Room is Successfully.')
        }else {
          alert('Room is already exits.')
        }
    });
}

function setDisplay(id, size, name){
    console.log(id);
    displayRoomProfile();
    $(id).modal('show');

    if (!location.hash) {
      // location.hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
      location.hash = name;
    }
    const roomHash = location.hash.substring(1);

    // TODO: Replace with your own channel ID
    drone = new ScaleDrone('yiS12Ts5RdNhebyM');
    // Room name needs to be prefixed with 'observable-'
    roomId = 'observable-' + roomHash;
    configuration = {
      iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
      }]
    };

    drone.on('open', error => {
        if (error) {
          return console.error(error);
        }
          room = drone.subscribe(roomId);
        room.on('open', error => {
          if (error) {
            onError(error);
          }
        });
        // We're connected to the room and received an array of 'members'
        // connected to the room (including us). Signaling server is ready.
        room.on('members', members => {
          console.log('MEMBERS', members);
          // If we are the second user to connect to the room we will be creating the offer
          // const isOfferer = members.length === parseInt(size);
          const isOfferer = members.length >= 2;
          console.log(members.length + " | " + parseInt(size));
          startWebRTC(isOfferer);
        });
    });
}

function onSuccess() {};
function onError(error) {
  console.error(error);
};

function sendMessage(message) {
  drone.publish({
    room: roomId,
    message
  });
}

function startWebRTC(isOfferer) {
  console.log(isOfferer);
  pc = new RTCPeerConnection(configuration);

  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  pc.onicecandidate = event => {
    if (event.candidate) {
      sendMessage({'candidate': event.candidate});
    }
  };

  // If user is offerer let the 'negotiationneeded' event create the offer
  if (isOfferer) {
    pc.onnegotiationneeded = () => {
      pc.createOffer().then(localDescCreated).catch(onError);
    }
  }

  // When a remote stream arrives display it in the #remoteVideo element
  pc.ontrack = event => {
    const stream = event.streams[0];
    console.log(event.streams.length);
    if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
      remoteVideo.srcObject = stream;
    }
  };

  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then(stream => {
    // Display your local video in #localVideo element
    localVideo.srcObject = stream;
    // Add your stream to be sent to the conneting peer
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  }, onError);

  // Listen to signaling data from Scaledrone
  room.on('data', (message, client) => {
    // Message was sent by us
    if (client.id === drone.clientId) {
      return;
    }

    if (message.sdp) {
      // This is called after receiving an offer or answer from another peer
      pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
        // When receiving an offer lets answer it
        if (pc.remoteDescription.type === 'offer') {
          pc.createAnswer().then(localDescCreated).catch(onError);
        }
      }, onError);
    } else if (message.candidate) {
      // Add the new ICE candidate to our connections remote description
      pc.addIceCandidate(
        new RTCIceCandidate(message.candidate), onSuccess, onError
      );
    }
  });
}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () => sendMessage({'sdp': pc.localDescription}),
    onError
  );
}

function localDescCreated2(desc) {
  pc2.setLocalDescription(
    desc,
    () => sendMessage({'sdp': pc2.localDescription}),
    onError
  );
}

function localDescCreated3(desc) {
  pc3.setLocalDescription(
    desc,
    () => sendMessage({'sdp': pc3.localDescription}),
    onError
  );
}

function login(){
    console.log("doing");
    // var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if(email != '' && password != ''){
        var storesRef = dbRef.child('users');
        var readStore = storesRef.once('value', function(data) {
            // updateStarCount(postElement, snapshot.val());
            var bol = true;
            var emailtext = "";
            var image = "";
            var username = "";
            var id = "";
            data.forEach(function(child) {
                var user = child.val();
                console.log(user);
                console.log(user.email);
                console.log(user.password);
                console.log(email);
                console.log(password);
                if (user.email == email && user.password == password) {
                    bol = false;
                    id = user.id;
                    username = user.username;
                    image = user.image;
                    emailtext = user.email;
                }
                console.log(bol);
            });
            console.log(bol);
            if (!bol) {
                if (typeof(Storage) !== "undefined") {
                    // Store
                    localStorage.setItem("username", username);
                    localStorage.setItem("id", id);
                    localStorage.setItem("image", image);
                    localStorage.setItem("email", emailtext);
                    // Retrieve
                    // document.getElementById("result").innerHTML = localStorage.getItem("lastname");
                } else {
                    alert('Sorry, your browser does not support Web Storage...')
                }
                window.location.href = "dashboard.html";
                alert('Login is Successfully.')
            }else {
              alert('Email not found.')
            }
        });
    }else{
        alert('You are missing title or description.')
    }
}

function register(){
    console.log("doing");
    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if(username != '' && email != '' && password != ''){
        var storesRef = dbRef.child('users');
        var bol = true;
        var readStore = storesRef.once('value', function(data) {
            // updateStarCount(postElement, snapshot.val());
            data.forEach(function(child) {
                var user = child.val();
                console.log(user);
                console.log(user.email);
                if (user.email == email) {
                    bol = false;
                    console.log("doing ?");
                }
            });
            if (bol) {
                var newStoreRef = storesRef.push();
                var key = newStoreRef.key;
                newStoreRef.set({
                    "id": key,
                    "username": username,
                    "image" : "https://firebasestorage.googleapis.com/v0/b/testfirebase-71c46.appspot.com/o/user_default.png?alt=media&token=917f7b07-58e4-481d-bb58-180e6762b69d",
                    "email": email,
                    "password": password,
                });
                window.location.href = "login.html";
                alert('Register is Successfully.')
            }else {
              alert('Email is already exits.')
            }
        });
    }else{
        alert('You are missing title or description.')
    }
}

function userClicked(e) {
  	var userID = e.target.getAttribute("child-key");

  	const userRef = dbRef.child('users/' + userID);
  	const userDetailUI = document.getElementById("userDetail");

  	userDetailUI.innerHTML = "";

  	userRef.on("child_added", snap => {
    		var $p = document.createElement("p");
    		$p.innerHTML = snap.key  + " - " +  snap.val()
    		userDetailUI.append($p);
  	});
}
