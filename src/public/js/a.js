const socket = io();
const $welcome = document.querySelector("#welcome");
const $rNForm = document.querySelector("#rN");
const $room = document.querySelector("#room");
const $nickForm = document.querySelector("#nick");

let roomName;

$room.hidden = true;

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = $room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You : ${value}`);
  });
  input.value = "";
}

function handleNickNameSubmit(event) {
  event.preventDefault();
  const input = $welcome.querySelector("#nick input");
  const value = input.value;
  socket.emit("nickName", value);
  input.value = "";
  console.log(value);
  $nickForm.hidden = true;
}

$nickForm.addEventListener("submit", handleNickNameSubmit);

function showRoom() {
  console.log("showRoom");
  $room.hidden = false;
  const h3 = $room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = $room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleSubmit(event) {
  event.preventDefault();
  const input = $rNForm.querySelector("input");
  roomName = input.value;
  socket.emit("enter-room", roomName, showRoom);
  input.value = "";
  console.log(roomName);
  $rNForm.hidden = true;
}
// const $rNForm = document.querySelector("#rN");

$rNForm.addEventListener("submit", handleSubmit);

function addMessage(message) {
  const ul = $room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = `${message}`;
  ul.append(li);
}

socket.on("all", (user, newCount) => {
  addMessage(`${user} arrived`);
  const h3 = $room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})` ;
});

socket.on("bye", (user,newCount) => {
  addMessage(`${user} left`);
  const h3 = $room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})` ;
});

socket.on("new_message", addMessage);
socket.on("nickName", addMessage);
socket.on("createRoom", (rooms) => {
  const roomList = $welcome.querySelector("ul");
  roomList.innerText = "";
  if(rooms.length === 0){
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

// const messageList = document.querySelector('ul');
// const messageForm = document.querySelector('#message');
// const nickForm = document.querySelector('#nickname');

// function makeMessage(type,payload) {
//   const msg = {type, payload};
//   return JSON.stringify(msg);
// };

// const socket = new WebSocket(`ws://${window.location.host}`);
// socket.addEventListener("open", () => {
//   console.log("Connected to Server");
// });
// socket.addEventListener("message", (message) => {
//   // console.log("Message:", message.data);
//   const li = document.createElement("li");
//   li.innerText = message.data;
//   messageList.append(li);
// });
// socket.addEventListener("close", () => {
//   console.log("Closed");
// });

// // setTimeout(()=>{
// //     socket.send("hello from browser");
// // },5000)

// function handleSubmit(event){
//   event.preventDefault();
//   const input = messageForm.querySelector('input');
//   socket.send(makeMessage("new_message", input.value));
//   input.value = '';
// };
// function handleNickSubmit(event){
//   event.preventDefault();
//   const input = nickForm.querySelector('input');
//   socket.send(makeMessage("nickname",input.value));
//   input.value = '';
// };
// messageForm.addEventListener("submit", handleSubmit);
// nickForm.addEventListener("submit", handleNickSubmit);
