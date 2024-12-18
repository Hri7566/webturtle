/**
 * Socket class
 */

import type { ServerWebSocketTurtle } from ".";
import { EventEmitter } from "events";
import { Turtle } from "./turtle";
import { Web } from "./web";

export enum SocketType {
    OTHER = "other",
    TURTLE = "turtle",
    BROWSER = "browser",
}

export class Socket extends EventEmitter {
    private _id: string;
    private uuid: string;
    private ip: string;
    private type: SocketType = SocketType.OTHER;

    public turtle: Turtle;
    public web: Web;

    constructor(public ws: ServerWebSocketTurtle) {
        super();
        this._id = "";
        this.uuid = crypto.randomUUID();
        this.ip = ws.data.ip;
        this.turtle = new Turtle(this);
        this.web = new Web(this);

        this.on("iamaturtle", (msg) => {
            console.log("Received iamaturtle message:", msg);
            this.type = SocketType.TURTLE;
            this.turtle.bindEventListeners();
        });

        this.on("iamabrowser", (msg) => {
            console.log("Received iamabrowser message:", msg);
            this.type = SocketType.BROWSER;
            this.web.bindEventListeners();
        });
    }

    public getUserID() {
        return this._id;
    }

    public getUUID() {
        return this.uuid;
    }

    public getIP() {
        return this.ip;
    }

    public getType() {
        return this.type;
    }

    public destroyed = false;

    public destroy() {
        // Socket was closed or should be closed, clear data

        // Simulate closure
        try {
            if (this.ws) this.ws.close();
        } catch (err) {}

        this.destroyed = true;
    }

    public send(msgs: any) {
        try {
            this.ws.send(JSON.stringify(msgs));
        } catch (err) {}
    }
}

export const socketsByUUID = new Map<Socket["uuid"], Socket>();
// biome-ignore lint/suspicious/noExplicitAny: global access for console
(globalThis as any).socketsByUUID = socketsByUUID;

/**
 * Find all sockets by their user ID
 * also not unique
 * @param _id User ID to find
 * @returns Socket objects
 **/
export function findSocketsByUserID(_id: string) {
    const sockets = [];

    for (const socket of socketsByUUID.values()) {
        // logger.debug("User ID:", socket.getUserID());
        if (socket.getUserID() === _id) sockets.push(socket);
    }

    return sockets;
}

/**
 * Find a socket by their IP
 * probably not unique if they're on different tabs
 * @param ip IP to find
 * @returns Socket object
 **/
export function findSocketByIP(ip: string) {
    for (const socket of socketsByUUID.values()) {
        if (socket.getIP() === ip) {
            return socket;
        }
    }
}

export function getTurtleSockets() {
    return [
        ...socketsByUUID
            .values()
            .filter((s) => s.getType() === SocketType.TURTLE),
    ];
}
