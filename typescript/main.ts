import net from "node:net";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();

    const lines = req.split("\r\n");
    const reqLine = lines[0];
    const details = reqLine?.split(" ");

    const path = details![1];
    
    if(path === "/") {
      // Send 200 OK when client connects, ignore data for now
      const ok = "HTTP/1.1 200 OK\r\n\r\n";
      socket.write(ok);
      console.log(ok);
    }
    else if(path?.includes("/echo")) {
      const subpaths = path.split("/");
      const str: string = subpaths[2] as string;

      const resStatus = "HTTP/1.1 200 OK\r\n";
      const resHeaders = `Content-Type: text/plain\r\nContent-Length: ${str.length}\r\n`;
      const resBody = `\r\n${str}`;

      socket.write(resStatus);
      socket.write(resHeaders);
      socket.write(resBody);
    }
    else if(path?.includes("/user-agent")) {
      const userAgent = lines[2] as string;
      const uaValue = userAgent.replace("User-Agent: ", "");

      const resStatus = "HTTP/1.1 200 OK\r\n";
      const resHeaders = `Content-Type: text/plain\r\nContent-Length: ${uaValue.length}\r\n`;
      const resBody = `\r\n${uaValue}`;

      socket.write(resStatus);
      socket.write(resHeaders);
      socket.write(resBody);
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
