import net from "node:net";
import fs from "node:fs";
import path from "node:path";

const notFound = "HTTP/1.1 404 Not Found\r\n\r\n";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();

    const lines = req.split("\r\n");
    const reqLine = lines[0];
    const details = reqLine?.split(" ");

    const urlPath = details![1];
    
    if(urlPath === "/") {
      // Send 200 OK when client connects, ignore data for now
      const ok = "HTTP/1.1 200 OK\r\n\r\n";
      socket.write(ok);
      console.log(ok);
    }
    else if(urlPath?.includes("/echo")) {
      const subpaths = urlPath.split("/");
      const str: string = subpaths[2] as string;

      const resStatus = "HTTP/1.1 200 OK\r\n";
      const resHeaders = `Content-Type: text/plain\r\nContent-Length: ${str.length}\r\n`;
      const resBody = `\r\n${str}`;

      socket.write(resStatus);
      socket.write(resHeaders);
      socket.write(resBody);
    }
    else if(urlPath?.includes("/user-agent")) {
      const userAgent = lines[2] as string;
      const uaValue = userAgent.replace("User-Agent: ", "");

      const resStatus = "HTTP/1.1 200 OK\r\n";
      const resHeaders = `Content-Type: text/plain\r\nContent-Length: ${uaValue.length}\r\n`;
      const resBody = `\r\n${uaValue}`;

      socket.write(resStatus);
      socket.write(resHeaders);
      socket.write(resBody);
    }
    else if(urlPath?.includes("/files")) {
      const subpaths = urlPath.split("/");
      const fileName: string = subpaths[2] as string;

      const args = process.argv;
      if(args.length < 4) {
        // Must have directory flag in order to run
        return socket.write(notFound);
      }

      // 1st arg is ts-node, 2nd arg is main.ts
      // 3rd arg is directory flag, 4th arg is dir path
      const dirFlag = args[2];
      if(dirFlag !== "--directory") {
        return socket.write(notFound);
      }
      const filePath = path.resolve(args[3] as string, fileName);

      // File lookup
      try {
        const data = fs.readFileSync(filePath, "utf-8");
        console.log(data);
        // If file exists, return 200 OK with the file contents
        const resStatus = "HTTP/1.1 200 OK\r\n";
        const resHeaders = `Content-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n`;
        const resBody = `\r\n${data}`;

        socket.write(resStatus);
        socket.write(resHeaders);
        socket.write(resBody);
      } catch(err) {
        // If file not exist, return 404 Not Found
        socket.write(notFound);
      }
    }
    else {
      // Send 404 Not Found for every other path
      socket.write(notFound);
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
