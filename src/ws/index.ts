/**
 * Main websocket server
 */

import type { ServerWebSocket } from "bun";
import { getTurtleSockets, Socket, socketsByUUID } from "./Socket";
import path from "path/posix";
import fs from "fs";

export type ServerWebSocketTurtle = ServerWebSocket<{
    ip: string;
    socket: Socket;
}>;

function handleMessage(socket: Socket, data: string) {
    try {
        const msgs = JSON.parse(data);

        for (const msg of msgs) {
            socket.emit(msg.m, msg);
        }
    } catch (err) {}
}

async function asyncMap(
    array: unknown[],
    callback: (...args: unknown[]) => Promise<unknown[]>
) {
    const promises = array.map(callback); // Map each element to a promise
    return Promise.all(promises); // Wait for all promises to resolve
}

async function middleware(path: string): Promise<Response | void> {
    switch (path) {
        case "/list":
            const turtleSockets = getTurtleSockets();
            const turtleData = [];

            for (const socket of turtleSockets) {
                turtleData.push({
                    name: await socket.turtle.getName(),
                    id: socket.getUUID(),
                });
            }

            console.log(turtleData);

            return new Response(
                `<select name="turtle-list" id="turtle-list">${turtleData
                    .map((n) => `<option value="${n.id}">${n.name}</option>`)
                    .join("")}</select>`
            );
    }
}

export const startServer = () => {
    return Bun.serve({
        async fetch(req, server) {
            const reqip = server.requestIP(req);
            if (!reqip) return new Response("go away");

            const ip = req.headers.get("x-forwarded-for") || reqip.address;

            if (server.upgrade(req, { data: { ip } })) {
                return;
            }

            const url = new URL(req.url).pathname;
            let file = path.join("./public/", url);

            if (file === "public/") file = "public/index.html";

            let override = await middleware(url);

            if (!override) {
                if (fs.lstatSync(file).isFile()) {
                    const data = Bun.file(file);

                    if (data) {
                        return new Response(data);
                    }

                    return new Response("broken");
                }
            } else {
                return override;
            }

            return new Response("broken");
        },

        websocket: {
            async open(ws: ServerWebSocketTurtle) {
                ws.data.socket = new Socket(ws);
                ws.data.socket.send([{ m: "hi" }]);
                socketsByUUID.set(ws.data.socket.getUUID(), ws.data.socket);
            },

            async message(ws: ServerWebSocketTurtle, message) {
                const msg = message.toString();
                handleMessage(ws.data.socket, msg);
            },

            async close(ws: ServerWebSocketTurtle, code, reason) {
                const socket = ws.data.socket as Socket;
                if (socket) {
                    socket.destroy();

                    for (const sockID of socketsByUUID.keys()) {
                        const sock = socketsByUUID.get(sockID);

                        if (sock === socket) {
                            socketsByUUID.delete(sockID);
                        }
                    }
                }
            },
        },
    });
};
