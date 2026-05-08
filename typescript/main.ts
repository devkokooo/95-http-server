import net from "node:net";
import fs from "node:fs";
import path from "node:path";

const notFound = "HTTP/1.1 404 Not Found\r\n\r\n";

// https://www.rfc-editor.org/rfc/rfc2616#section-4
function parseHeaders(reqData: string) {
  const lines = reqData.split("\r\n");

  // First line is always Request / Status line
  const [method, path, httpVersion] = lines[0]?.split(" ") as string[];

  // Headers are always in the form field-name: field-value
  const headers = {};
  for(let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const idx = line?.indexOf(":") as number;

    if(idx === -1) continue;

    const name = line?.slice(0, idx).trim().toLowerCase();
    const value = line?.slice(idx + 1).trim();
    headers[name] = value;
  }

  return { method, path, httpVersion, headers };
}

function splitHeadBody(buffer: string): { head: string; body: string } {
  const marker = "\r\n\r\n";
  const idx = buffer.indexOf(marker);
  if(idx === -1) return { head: "", body: "" };

  const head = buffer.slice(0, idx).toString();
  const body = buffer.slice(idx + marker.length);

  return { head, body };
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();
    const { head, body } = splitHeadBody(req);

    const reqData = parseHeaders(head);
    console.log(reqData);

    const method = reqData.method;
    const urlPath = reqData.path;

    if(urlPath === "/") {
      // Send 200 OK when client connects, ignore data for now
      const ok = "HTTP/1.1 200 OK\r\n\r\n";
      socket.write(ok);
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
      const userAgent = reqData.headers["user-agent"] as string;

      const resStatus = "HTTP/1.1 200 OK\r\n";
      const resHeaders = `Content-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n`;
      const resBody = `\r\n${userAgent}`;

      socket.write(resStatus);
      socket.write(resHeaders);
      socket.write(resBody);
    }
    else if(urlPath?.includes("/files")) {
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

      const subpaths = urlPath.split("/");
      const fileName: string = subpaths[2] as string;
      const filePath = path.resolve(args[3] as string, fileName);

      if(method === "GET") {
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
      else if(method === "POST") {
        const contentLength: number = reqData.headers["content-length"] ?
          parseInt(reqData.headers["content-length"], 10) : 0;
        
        // File save
        try {
          const content = body.toString();
          fs.writeFileSync(filePath, content);

          // If save successful, return 201 Created
          socket.write("HTTP/1.1 201 Created\r\n\r\n");
        } catch(err) {
          console.error(err);
        }
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
