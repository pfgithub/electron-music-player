const fs = require("fs");

let restricted_count = undefined;

const args = [...process.argv];
args.shift(); args.shift();
while(args.length) {
    const arg = args.shift();
    if(arg === "--restrict") {
        restricted_count =+ args.shift();
        if(!restricted_count) throw new Error("bad restricanjdtf§lnkj");
    }else if(arg === "--help") {
        console.log("help: look at the source code, the arg parsing code is at the top. recommended use `| less` to view output");
        process.exit(1);
    }else throw new Error("bad argument : "+arg);
}

const log = fs.readFileSync(require("os").homedir+"/.cache/electron-music-player/logs/log.log", "utf-8").split("\n").filter(l => l).map(l => JSON.parse(l));

function secToStr(sec) {
    if(sec > 60) {
        const min = sec / 60;
        if(min > 60) {
            const hr = min / 60;
            return hr.toFixed(2) + " hours";
        }
        return min.toFixed(2) + " mins";
    }
    return sec.toFixed(2) + " secs";
}

let days_in_ms = 1000 * 60 * 60 * 24;

let total_time = 0;
let time_per_song = {};
log.forEach(itm => {
    if(restricted_count && itm.time < Date.now() - restricted_count * days_in_ms) return;
    if(itm.opt === "start-playing") {
        if(!itm.previous_song.max_timestamp) return; // song hadn't even loaded by the time it got next'd || song is null
        total_time += itm.previous_song.timestamp;
        if(!Object.hasOwnProperty.call(time_per_song, itm.previous_song.name)) time_per_song[itm.previous_song.name] = {name: itm.previous_song.name, reasons: {}};
        const pval = time_per_song[itm.previous_song.name];
        const addWithReason = (reason) => {
            if(!Object.hasOwnProperty.call(pval.reasons, reason)) pval.reasons[reason] = {time: 0, plays: 0};
            const rsn = pval.reasons[reason];
            rsn.time += itm.previous_song.timestamp;
            rsn.plays += itm.previous_song.timestamp / itm.previous_song.max_timestamp;
        };
        addWithReason("all");
        //if(itm.kind === "queue_immediate") {
        //    addWithReason("intentional");
        //}
        // TODO:
        // if (time >= 1616485573003) { // ← when prequeued was added (log entries need a version marker don't they)
        // // :: when an item is added to the queue, +1 it
        // // :: when an item is found with prequeued mode, if it was added to the queue, -1 it and mark it as 'intentional' + 'prequeued' else just mark it 'prequeued'
        // // :: otherwise add it based on the mode it was found with
    }
});
time_per_song = Object.values(time_per_song).sort((a, b) => b.reasons.all.plays - a.reasons.all.plays);
if(restricted_count) console.log("Stats are from: Past "+restricted_count+" days");
else console.log("Stats are from: All time (--restrict 25 to restrict to past 25 days)");
console.log("total play time:",secToStr(total_time));
console.log("by song:");
time_per_song.map((s, i) => {
    console.log(
        ((i+1)+": ").padEnd(5),
        (s.reasons.all.plays.toFixed(2)+"×").padStart(8)+" ",
        cutoffsongname(s.name)+".mp3 ",
        Object.entries(s.reasons).sort(([, a], [, b]) => b.plays - a.plays).map(([k, v]) => v.plays.toFixed(2) + "×" + k + "←" + secToStr(v.time)).join(", ")
    );
});

function cutoffsongname(str) {
    if(!str.endsWith(".mp3")) throw new Error("!.endsWith(.mp3)");
    str = str.replace(/\.mp3$/, "");
    str = str.split(" - ").map(it => it.trim()).join(" - ");
    const dashsplit = str.split(" - ");
    if(dashsplit.length === 2){// && str.length > 50) {
        const [author, title] = dashsplit;
        if(author.length > 25 - 3) {
            if(title.length <= 25) {
                return (cutoff(author, 50 - 3 - title.length).trim().padStart(50 - 3 - title.length) + " - " + title).trim().padEnd(50);
            }
        }
        if(title.length > 25) {
            if(author.length <= 25 - 3) {
                return (author + " - " + cutoff(title, 50 - 3 - author.length).padEnd(50 - 3 - author.length)).trim().padStart(50);
            }
        }
        return cutoff(author, 25 - 3).trim().padStart(25 - 3) + " - " + cutoff(title, 25);
        //return cutoff(cutoff(author, 15).trim() + " - " + title, 50);
    }else{
        return cutoff(str, 50);
    }
}

function cutoff(str, len) {
    if(str.length <= len) return str.padEnd(len);
    return (str.substring(0, len - 1) + (str.length > len - 1 ? "…" : "")).padEnd(len);
}
