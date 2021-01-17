const ipc = require("node-ipc");

let msg = process.argv[2] ?? "";

// fish -c "node src/ipc.js playsong (node src/ipc.js listall | rofi -dmenu -i)"
if(msg === "playsong" || msg === "queue") {
    if(process.argv.length !== 4) {
        console.error("Usage: "+process.argv[0]+" "+process.argv[1]+" playsong 'song value'");
        process.exit(1);
    }
    msg = [msg, process.argv[3]];
}else{
    if(process.argv.length !== 3) {
        console.error("Usage: "+process.argv[0]+" "+process.argv[1]+" message");
        process.exit(1);
    }
}

ipc.config.id = "music";
ipc.config.logger = (...msg) => {};
ipc.connectTo("music", __dirname+"/../musicplayer.socket", () => {
    // console.log("Connected!");
    ipc.of.music.emit("message", msg, () => console.log("oi"));
    ipc.of.music.on("message", (msg) => {
        if(msg.results) {
            console.log(msg.results.join("\n"));
        } else {
            console.log("Sent!");
        }
        process.exit(msg.notice === "handled" ? 0 : 1);
        // console.log("Exited");
    });
});
setTimeout(() => {
    console.log("Timeout!");
    process.exit(1)
}, 1000 * 20);