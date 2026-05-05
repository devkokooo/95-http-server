import net from "node:net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    console.log("Client connected with data: " + data);

    // Send 200 OK when client connects, ignore data for now
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
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
