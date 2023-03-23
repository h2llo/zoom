import http from "http";
// import { WebSocketServer } from "ws";
import { Server } from "socket.io";
import express from "express";
import {instrument} from "@socket.io/admin-ui";
const app = express();
console.log("hello");
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
const handleListen = () => console.log("listening on http://localhost:4000");
const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin: ["http://admin.socket.io"],
    credentials: true,
  },
});
instrument(io,{
  auth: false
});
function publicRooms() {
  // const sids = io.sockets.adapter.sids;
  // const rooms = io.sockets.adapter.rooms;
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_,key) => {
    if(sids.get(key)===undefined){
      publicRooms.push(key)
    }
  })
  return publicRooms;
}

function countRoom(roomName){
  return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection", (socket) => {
  socket["nickName"] = "anony";
  socket.on("enter-room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("all", socket.nickName, countRoom(roomName));
    io.sockets.emit('createRoom',publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickName, countRoom(room)-1)
    );
  });
  socket.on('disconnect',()=>{
    io.sockets.emit('createRoom',publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickName}: ${msg}`);
    done();
  });
  socket.on("nickName", (nickname) => (socket["nickName"] = nickname));
});

// const wss = new WebSocketServer({ server });
// const sockets = [];
// wss.on("connection", (socket) => {
//   socket["nickname"] = "anonymous";
//   sockets.push(socket);
//   console.log("connection to browser");
//   socket.on("close", () => console.log("disconnected"));
//   socket.on("message", (msg) => {
//     const messageParsed = JSON.parse(msg);
//     switch (messageParsed.type) {
//       case "new_message":
//         sockets.forEach((socketsEl) =>
//           socketsEl.send(`${socket.nickname}: ${messageParsed.payload}`)
//         );
//         break;
//       case "nickname":
//         socket["nickname"] = messageParsed.payload;
//         console.log(socket.nickname)
//         break;
//     }
//     // if(messageParsed.type === "new_message"){
//     //   sockets.forEach(socketsEl => socketsEl.send(messageParsed.payload.toString()));
//     // }else if(messageParsed.type === "nickname"){
//     //   console.log(messageParsed.payload)
//     // }
//   });
// });
server.listen(4000, handleListen);
