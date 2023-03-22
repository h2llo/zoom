import http from "http";
import { WebSocketServer } from "ws";
import express from "express";
const app = express();
console.log("hello");
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
const handleListen = () => console.log("listening on http://localhost:4000");
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const sockets = [];
wss.on("connection", (socket) => {
  socket["nickname"] = "anonymous";
  sockets.push(socket);
  console.log("connection to browser");
  socket.on("close", () => console.log("disconnected"));
  socket.on("message", (msg) => {
    const messageParsed = JSON.parse(msg);
    switch (messageParsed.type) {
      case "new_message":
        sockets.forEach((socketsEl) =>
          socketsEl.send(`${socket.nickname}: ${messageParsed.payload}`)
        );
        break;
      case "nickname":
        socket["nickname"] = messageParsed.payload;
        console.log(socket.nickname)
        break;
    }
    // if(messageParsed.type === "new_message"){
    //   sockets.forEach(socketsEl => socketsEl.send(messageParsed.payload.toString()));
    // }else if(messageParsed.type === "nickname"){
    //   console.log(messageParsed.payload)
    // }
  });
});
server.listen(4000, handleListen);
