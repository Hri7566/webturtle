import { socketsByUUID, SocketType, type Socket } from "../Socket";

export class Web {
    constructor(public socket: Socket) {}

    public bindEventListeners() {
        this.socket.on("forward", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            console.log(msg);
            console.log(s);
            console.log([...socketsByUUID.keys()]);
            if (!s) return;
            await s.turtle.forward();
        });

        this.socket.on("back", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.back();
        });

        this.socket.on("left", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.turn("left");
        });

        this.socket.on("right", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.turn("right");
        });

        this.socket.on("up", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.up();
        });

        this.socket.on("down", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.down();
        });

        this.socket.on("refuel", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.refuel();
        });

        this.socket.on("dig", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.dig();
        });

        this.socket.on("digup", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.dig("up");
        });

        this.socket.on("digdown", async (msg) => {
            const s = socketsByUUID.get(msg.id);
            if (!s) return;
            await s.turtle.dig("down");
        });
    }
}
