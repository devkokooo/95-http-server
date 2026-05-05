import net from "node:net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();
    console.log(req);

    const lines = req.split("\n");
    const reqLine = lines[0];
    const details = reqLine?.split(" ");

    const path = details![1];
    
    if(path === "/") {
      // Send 200 OK when client connects, ignore data for now
      const ok = "HTTP/1.1 200 OK\r\n\r\n";
      socket.write(ok);
      console.log(ok);
    }
    else {
      // Send 404 Not Found for every other path
      const notFound = "HTTP/1.1 404 Not Found\r\n\r\n";
      socket.write(notFound);
      console.log(notFound);
    }
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
