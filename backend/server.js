
const express = require("express");
const http = require("http");
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors())
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
    allowRequest: (req, callback) => {
        const noOriginHeader = req.headers.origin === undefined;
        callback(null, noOriginHeader);
    }
});

io.on("connection", (socket) => {
    socket.emit("me", socket.id)

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    })

    socket.on("callUser", (data) =>{
        io.io(data.userToCall).emit("callUser",  {signal:data.signalData, from: data.from, name: data.name })
    })

    socket.on("answerCall", (data) => io.to(data.to).emit("callAccepted"), data.signal)
})

server.listen(5000, () => console.log("HEREEE is"))