const ipc = require("node-ipc");

if(process.argv.length !== 3) {
    console.log("Usage: node testclient.js message");
    process.exit(1);
};
const msg = process.argv[2];


ipc.config.id = "music";
ipc.config.logger = (...msg) => console.log(...msg);
ipc.connectTo("music", __dirname+"/../musicplayer.socket", () => {
    console.log("Connected!");
    ipc.of.music.emit("message", msg, () => console.log("oi"));
    ipc.of.music.on("message", (msg) => {
        console.log("Sent!");
        process.exit(msg === "handled" ? 0 : 1);
    });
});
setTimeout(() => {
    console.log("Timeout!");
    process.exit(1)
}, 1000 * 20);