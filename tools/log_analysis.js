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
        if(!Object.hasOwnProperty.call(time_per_song, itm.previous_song.name)) time_per_song[itm.previous_song.name] = {name: itm.previous_song.name, c: 0, l: itm.previous_song.max_timestamp};
        if(time_per_song[itm.previous_song.name].l.toFixed(3) !== itm.previous_song.max_timestamp.toFixed(3)) console.log("Uh oh! Max timestamps differ with "+itm.previous_song.name+". One: "+itm.previous_song.max_timestamp+", Two: "+time_per_song[itm.previous_song.name].l);
        time_per_song[itm.previous_song.name].c += itm.previous_song.timestamp;
    }
});
time_per_song = Object.values(time_per_song).map(v => ({...v, count: v.c / v.l})).sort((a, b) => b.count - a.count);
if(restricted_count) console.log("Past "+restricted_count+" days");
else console.log("All time:");
console.log("total play time:",secToStr(total_time));
console.log("by song:");
time_per_song.map((s, i) => {
    console.log((i+1)+": ", s.count.toFixed(2)+"×"+s.name + " : "+secToStr(s.c));
});
