import type { Socket } from "../Socket";

export class Turtle {
    constructor(public socket: Socket) {}

    public bindEventListeners() {}

    public turn(direction: string) {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "turn",
                    direction,
                },
            ]);

            this.socket.once("finish_turn", () => {
                resolve(true);
            });
        });
    }

    public forward() {
        console.log("moving forward");
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "forward",
                },
            ]);

            this.socket.once("finish_forward", () => {
                resolve(true);
            });
        });
    }

    public back() {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "back",
                },
            ]);

            this.socket.once("finish_back", () => {
                resolve(true);
            });
        });
    }

    public up() {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "up",
                },
            ]);

            this.socket.once("finish_up", () => {
                resolve(true);
            });
        });
    }

    public down() {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "down",
                },
            ]);

            this.socket.once("finish_down", () => {
                resolve(true);
            });
        });
    }

    public getFuel() {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "getfuel",
                },
            ]);

            this.socket.once("fuel", (msg) => {
                if (!msg.fuel) reject(false);
                resolve(msg.fuel);
            });
        });
    }

    public refuel() {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "refuel",
                },
            ]);

            this.socket.once("fuel", (msg) => {
                resolve(msg.fuel);
            });
        });
    }

    public dig(direction?: string) {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "dig",
                    direction,
                },
            ]);

            this.socket.once("finish_dig", (msg) => {
                resolve(true);
            });
        });
    }

    public setName(name: string) {
        return new Promise((resolve, reject) => {
            this.socket.send([{ m: "setname", name }]);

            this.socket.once("finish_setname", () => {
                resolve(true);
            });
        });
    }

    public getName() {
        return new Promise((resolve, reject) => {
            this.socket.send([{ m: "getname" }]);

            this.socket.once("name", (msg) => {
                console.log(msg);
                resolve(msg.name);
            });
        });
    }

    public getInventory() {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "getinv",
                },
            ]);

            this.socket.once("inv", (msg) => {
                resolve(msg.inv);
            });
        });
    }

    public select(slot: number) {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "select",
                    slot,
                },
            ]);

            this.socket.once("finish_select", (msg) => {
                resolve(true);
            });
        });
    }

    public inspect() {
        return new Promise((resolve, reject) => {
            this.socket.send([
                {
                    m: "inspect",
                },
            ]);

            this.socket.once("inspection", (msg) => {
                resolve(msg as { hasBlock: boolean; data: unknown });
            });
        });
    }
}
