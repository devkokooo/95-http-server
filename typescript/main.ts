import net from "node:net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log("Client connected with data: " + data);
    socket.write("Echo: " + data);
  });

  socket.on("end", () => {
    console.log("Client disconnected.");
  });

  socket.on("error", (err) => {
    console.error(err);
  });
});

server.listen(4221, "0.0.0.0", () => {
  console.log("Listening on port 4221...");
});
