function mixin(obj1, obj2) {
    for (var i in obj2) {
        if (obj2.hasOwnProperty(i)) {
            obj1[i] = obj2[i];
        }
    }
}

function EventEmitter() {
    this._events = {};
}
EventEmitter.prototype.on = function (evtn, fn) {
    if (!this._events.hasOwnProperty(evtn)) this._events[evtn] = [];
    this._events[evtn].push(fn);
};
EventEmitter.prototype.off = function (evtn, fn) {
    if (!this._events.hasOwnProperty(evtn)) return;
    var idx = this._events[evtn].indexOf(fn);
    if (idx < 0) return;
    this._events[evtn].splice(idx, 1);
};
EventEmitter.prototype.emit = function (evtn) {
    if (!this._events.hasOwnProperty(evtn)) return;
    var fns = this._events[evtn].slice(0);
    if (fns.length < 1) return;
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < fns.length; i++) fns[i].apply(this, args);
};

export class Client extends EventEmitter {
    constructor(uri) {
        super();
        this.uri = uri;
        this.bindEventListeners();
    }

    started = false;

    bindEventListeners() {
        this.on("hi", (msg) => {
            this.send([{ m: "iamabrowser" }]);
        });
    }

    start() {
        if (this.started) return;
        this.started = true;
        this.connect();
    }

    stop() {
        if (!this.started) return;
        this.started = false;
        this.ws.close();
    }

    connect() {
        this.ws = new WebSocket(this.uri);

        this.ws.addEventListener("open", () => {
            console.log("Connected to server");
            this.send([{ m: "iamabrowser" }]);
        });

        this.ws.addEventListener("close", () => {
            console.log("Disconnected from server");

            setTimeout(() => {
                this.connect();
            }, 3000);
        });

        this.ws.addEventListener("message", (data) => {
            const str = data.toString();

            try {
                const msgs = JSON.parse(str);

                for (const msg of msgs) {
                    this.emit(msg.m, msg);
                }
            } catch (err) {}
        });
    }

    send(msgs) {
        this.ws.send(JSON.stringify(msgs));
    }
}
