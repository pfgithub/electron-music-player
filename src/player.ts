import "./_stdlib";
import { child_process, enableIPC, fetch, ffmetadata_, fs, Genius, ipc, isWeb, Lyricist, notifier, os, path, uhtml } from "./crossplatform";
import { ColorProperty, config, getArtURL, getDarkLight, readTagsNoLock, SongTags, realEncodeURI, systemCacheDir } from "./cache";

console.log("IMPORT SUCCEEDED!", uhtml, config, realEncodeURI, getDarkLight, readTagsNoLock);

function $scss(data: TemplateStringsArray) {
    const styleValue = data[0];
    const styleElem = document.createElement("style");
    styleElem.appendChild(document.createTextNode(styleValue));
    document.head.appendChild(styleElem);
}


const render = uhtml.render;
const html = uhtml.html;
// const svg = uhtml.svg;

let lyricsClients: { genius: any; lyricist: any } | undefined;
try {
    const secret: { accessToken: string } = JSON.parse(fs.readFileSync("src/secret.json", "utf-8"));
    lyricsClients = {
        genius: new Genius(secret.accessToken),
        lyricist: new Lyricist(secret.accessToken),
    };
} catch (e) {
    console.log("secret.json not found +", e);
}

type FFMetadataMetadata = {
    artist?: string;
    album?: string;
    title?: string;
    track?: string;
    disc?: string;
    label?: string;
    date?: string;
};
type FFMetadataOptions = { attachments?: string[] };
type FFMetadata = {
    write: (path: string, m1: FFMetadataMetadata, options: FFMetadataOptions, cb: (e?: Error) => void) => void;
};
const ffmetadata = ffmetadata_ as FFMetadata;

$scss`
:root {
	--foreground: #fff;
	--background: #000;
	--background2: #000;
}
.hidden {display: none;}
@font-face {
    font-family: 'buttons';
    src: url('font/buttons.eot');
    src: url('font/buttons.eot') format('embedded-opentype'),
       url('font/buttons.woff2') format('woff2'),
       url('font/buttons.woff') format('woff'),
       url('font/buttons.ttf') format('truetype'),
       url('font/buttons.svg') format('svg');
    font-weight: normal;
    font-style: normal;
}
.fonticon {
    font-family: "buttons";
}
.menubtn{
	font-size: 1.2em;
	color: var(--foreground);
	width: 60px;
	height: 60px;
	padding: 0;
	margin: 0;
}
.nowplaying {
    z-index: 5;
    background: var(--background);
    border-radius: 0 0 10px 10px;
    position: sticky;
    top: 0;
    display: grid;
    grid-template-columns: max-content max-content max-content max-content max-content;
    -webkit-app-region: drag;
    & > * {
    	-webkit-app-region: no-drag;
    }
    box-shadow: 0 -10px 30px black;
    overflow-x: auto;
}

.verticallist {
	display: flex;
	flex-flow: column;
    user-select: text;
}
.vlitem {
}
.nowplaying_title {
	font-weight: bold;
}
.nowplaying_artist {
	font-style: italic;
}

.columns {
    width: 100%;
    box-sizing: border-box;
    
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}
.column {
    margin-bottom: 10px;
}
.vgrid {
    display: grid;
    gap: 10px;
    grid-auto-rows: max-content;
}
.hgrid {
    display: grid;
    gap: 10px;
    grid-auto-flow: column;
    grid-auto-columns: max-content;
}
ul, p, h1, h2 {margin: 0;}

@media screen and (max-width: 600px) {
	.columns {
        grid-template-columns: 1fr;
	}
}
.playlist_hide {
    display: none;
}
.nowplaying_art {
	width: 60px;
	height: 60px;
    box-shadow: 0 2px 9px -3px black;
}
.icon {
	width: 20px;
	height: 20px;
}
.lyricsedtr.vgrid.maxhv {
    grid-template-rows: max-content max-content 1fr;
}
body {
	background-color: var(--background);
	color: var(--foreground);
	padding: 0;
	margin: 0;
	font-family: sans-serif;
	user-select: none;
}
.nowplaying_lyrics {
	user-select: text;
}
.emp-mount > div {
	padding: 20px;
}
::-webkit-scrollbar {
	width: 4px;
    height: 4px;
	background: var(--background);
}
::-webkit-scrollbar-thumb {
	background: var(--foreground);
}
input {
	background-color: var(--background);
	color: var(--foreground);
	border: 2px solid var(--foreground);
	border-radius: 2px;
}
ul {
	padding-left: 0;
}
li {
	list-style-type: none;
}
li:hover, li.playing {
	background-color: var(--track-foreground);
	color: var(--track-background);
    box-shadow: 0 1px 9px -3px #000;
}
.lyricline:hover {
    background-color: var(--foreground);
    color: var(--background);
    box-shadow: 0 1px 9px -3px #000;
}
.icon {
	visibility: hidden;
}
li:hover > .icon {
	visibility: visible;
}
li > a {
	color: inherit;
	text-decoration: none;
}
.menupath {
	fill: var(--foreground);
}
.btnplay {
	display: none;
}
.btnpause {
	display: none;
}
.playpause.play > .btnpause {
	display: block;
}
.playpause:not(.play) > .btnplay {
	display: block;
}
button {
	background-color: transparent;
	border: none;
}
.loading {
	animation: spinner 1s ease-in-out 0 infinite forwards;
}
@keyframes spinner {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
.skipback {
	transform: rotate(180deg);
}

.random_filter {
    font-size: 13.3333px;
}

// more

.fullscreen_bg {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	width: 100%;
	height: 100%;
	z-index: -9999;
    &.fullscreen_blurred_image {
    	filter: blur(40px) brightness(0.5);
    	transform: scale(1.5);
    }
    &.fullscreen_overlay {
        background-color: var(--background);
        opacity: 0.3;
    }
}

body {
	overflow-x: hidden;
}

input {
	background-color: transparent;
}

li {
    position: relative;
}
.itembuttons {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    grid-auto-flow: column;
}
li:hover .itembuttons {
    display: grid;
}
.itembuttons button {
    cursor: pointer;
}
.itembuttons button:hover {
    background-color: var(--track-background);
    color: var(--track-foreground);
}
@keyframes particle {
    from {
        transform: translate(-50%, -50%);
        opacity: 1;
    }
    to {
        transform: translate(-50%, -150%);
        opacity: 0;
    }
}
.particle {
    z-index: 1000;
    position: fixed;
    pointer-events: none;
    top: var(--y);
    left: var(--x);
    color: var(--foreground);
    font-size: 16pt;
    animation: particle 1s;
    animation-fill-mode: both;
}
html {height: 100%;}
body {height: 100%;}
.lyricsedtr {
	padding: 20px;
    background-color: var(--background);
    color: var(--foreground);
    height: 100%;
    box-sizing: border-box;
    & h1, & h2 {
    	user-select: text;
    }
    & h2 {
        margin-bottom: 5px;
    }
}
.lyricsedtr-img {
    width: 80px;
    height: 80px;
    margin-right: 10px;
    vertical-align: middle;
    border-radius: 10px;
    border: 3px solid var(--foreground);
}
.h100 {
    height: 100%
}
textarea.lyricsedtr-input {
    padding: 10px;
    font-family: sans-serif;
}
.lyricsedtr-input {
    width: 100%;
    box-sizing: border-box;
    background-color: var(--foreground);
    color: var(--background);
    border: 0;
    padding: 5px 10px;
    box-shadow: inset 0 0 50px -20px var(--background);
    border-radius: 5px;
    transition: 0.1s box-shadow;
    resize: vertical;
    &:not(:disabled):hover {
        box-shadow: inset 0 0 50px -30px var(--background);
    }
    &:focus {
        box-shadow: inset 0 0 50px -100px var(--background);
    }
}
.lyricsedtr-hbox {
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr max-content;
}
:disabled {
    opacity: 0.5;
}
.lyricsedtr-button {
    background-color: var(--foreground);
    margin: 0;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    color: var(--background);
    box-shadow: 0 1px 10px -3px var(--foreground);
    border-radius: 5px;
    transition: 0.1s box-shadow;
    vertical-align: middle;
    &:not(:disabled):hover {
        box-shadow: 0 0 10px 0 var(--foreground);
        cursor: pointer; /* too bad */
    }
    &.unimportant {
        background-color: transparent;
        color: var(--foreground);
        box-shadow: none;
        &:not(:disabled):hover {
            box-shadow: 0 0 10px -3px var(--foreground);
        }
    }
}
.lyrics {
    white-space: pre-wrap;
}

.cmdpart:hover {
    color: var(--background);
    background-color: var(--foreground);
}

code {
    user-select: text;
}
`;

function spawnParticle(x: number, y: number, text: string) {
    el("div")
        .clss("particle")
        .styl({ "--x": x + "px", "--y": y + "px" })
        .atxt(text)
        .adto(body)
        .dwth(v => setTimeout(() => v.remove(), 1000));
}

type MusicData = {
    filename: string;
    path: string;
    uuid: symbol;
    tags: SongTags | undefined;
};

type Action =
    | {kind: "queue_end"; song: MusicData}
    | {kind: "queue_immediate"; song: MusicData}
    | {kind: "play"; set: true | "toggle" | false}
    | {kind: "automatic_next"}
    | {kind: "skip_back"}
    | {kind: "skip_fwd"}
    | {kind: "next_mode"; set: NextOpsID}
    | {kind: "update_music_array"}
;

type BaseLogAction = {time: number};
type PlayLogAction = {opt: "start-playing"; next_song: {name: string}; previous_song: {name: string; timestamp: number; max_timestamp: number}};
type LogAction = (
    | {kind: "queue_end"; song: {name: string}}
    | {kind: "queue_immediate"} & PlayLogAction
    | {kind: "play"}
    | {kind: "pause"}
    | {kind: "automatic_next_2"; mode: NextOpsID; random_filter: string} & PlayLogAction
    | {kind: "skip_back"} & PlayLogAction
    | {kind: "skip_fwd_2"; mode: NextOpsID; random_filter: string} & PlayLogAction
    | {kind: "update_song_meta"; song: {name: string}; meta_prev: {lyrics: string; title: string; artist: string}; meta_next: {lyrics: string; title: string; artist: string}}
);
type OutLogAction = BaseLogAction & LogAction;

function writeLog(action: LogAction) {
    const outa: OutLogAction = {time: Date.now(), ...action};
    if(!isWeb) (async () => {
        const cache_dir = systemCacheDir("electron-music-player") + "/logs/";
        const log_path = cache_dir + "log.log";
        await fs.promises.mkdir(cache_dir, {recursive: true});
        await fs.promises.appendFile(log_path, JSON.stringify(outa) + "\n", "utf-8");
    })();
}

const nextopts = [["Random", "random"], ["Random (Filtered)", "random_filter"], ["Loop", "loop"], ["End", "end"]] as const;
type NextOpsID = (typeof nextopts)[number][1] | "prequeued";
function MusicPlayer(mount: HTMLElement) {
    const defer = makeDefer();

    const fsimg = el("img")
        .clss("fullscreen_bg.fullscreen_blurred_image")
        .adto(mount)
        .drmv(defer);
    el("div")
        .clss("fullscreen_bg.fullscreen_overlay")
        .adto(mount)
        .drmv(defer);

    const nowPlayingBar = el("div")
        .clss("nowplaying")
        .adto(mount)
        .drmv(defer);

    const cols = el("div")
        .clss("columns")
        .adto(mount)
        .drmv(defer);
    const songlistcol = el("div")
        .clss(".column.vgrid")
        .adto(cols);
    const songlistsearch = el("input")
        .clss(".search.lyricsedtr-input")
        .adto(songlistcol)
        .attr({ type: "text", placeholder: "Search..." });
    const songlistbuttonrow = el("div").adto(songlistcol);
    const songlistaddbtn = el("button")
        .clss(".lyricsedtr-button.unimportant")
        .adto(songlistbuttonrow)
        .atxt("+ Add");
    const nextmode = el("select").clss(".random_filter").adto(songlistbuttonrow)
        .adch(...nextopts.map(([name, id]) => el("option").attr({value: id}).atxt(name)))
    ;
    const songlyricscol = el("div")
        .clss(".column.vgrid")
        .adto(cols);

    let rfon_prevmode: NextOpsID = "random";

    const queue: (MusicData | undefined)[] = [];
    let queueIndex = 0;

    // function setQueueIndexInternal(envy: number) {
    //     const nxtmode = nextmode.value as NextOpsID;
    //     let pqueueIndex = queueIndex;
    //     queueIndex = envy;
    //     if(nxtmode === "loop" && !queue[queueIndex]) {
    //         pqueueIndex = 0;
    //         data.nowPlayingUpdated += 1;
    //         return;
    //     }
    //     while (queueIndex < 0) {
    //         queue.unshift(undefined);
    //         queueIndex += 1;
    //     }
    //     if (!queue[queueIndex]) {
    //         if(nxtmode === "random") {
    //             queue[queueIndex] = randomOfArray(data.music);
    //         }else if(nxtmode === "random_filter") {
    //             queue[queueIndex] = randomOfArray(data.music.filter(song => playlistFilter(song, data.filter)));
    //         }else if(nxtmode === "loop") {
    //             assertNever(0 as never);
    //         }else if(nxtmode === "end") {
    //             data.nowPlaying = undefined;
    //             return;
    //         }else assertNever(nxtmode);
    //     }
    //     data.nowPlaying = queue[queueIndex];
    //     data.nowPlayingUpdated += 1;
    // }

    function internalPlayNext(): boolean {
        const nxtmode = nextmode.value as NextOpsID;
        const current_song = queue[queueIndex];
        queueIndex += 1;
        let res = false;
        if(!queue[queueIndex]) {
            if(nxtmode === "random") {
                const music_filtered = data.music;
                queue[queueIndex] = randomOfArray(music_filtered.length === 1 ? music_filtered : music_filtered.filter(song => song !== current_song));
            }else if(nxtmode === "random_filter") {
                const music_filtered = data.music.filter(song => song !== current_song && playlistFilter(song, data.filter));
                queue[queueIndex] = randomOfArray(music_filtered.length === 1 ? music_filtered : music_filtered.filter(song => song !== current_song));
            }else if(nxtmode === "loop") {
                queueIndex -= 1;
                // TODO two dropdowns. one for automatic next behaviour ("next" | "loop") one for when next happens on an empty slot
            }else if(nxtmode === "end") {
                // *do not* set queue[queueIndex] = undefined
                // instead, leave an empty slot so .push will replace it
            }else if(nxtmode === "prequeued") {
                assertNever(0 as never);
            }else assertNever(nxtmode);
            res = true;
        }
        // don't have [«song», , ] in the list. max [«song», ].
        if(!queue[queueIndex] && !queue[queueIndex - 1]) queueIndex -= 1;
        data.nowPlaying = queue[queueIndex];
        data.nowPlayingUpdated += 1;
        return res;
    }
    function internalPlayPrev() {
        queueIndex -= 1;
        if(queueIndex < 0) queueIndex = 0; // the zeroth item in the queue will always be undefined. why? I have no idea that would be good to look into and ¿fix?

        data.nowPlaying = queue[queueIndex];
        data.nowPlayingUpdated += 1;
    }

    function getSongNT(): {name: string; timestamp: number; max_timestamp: number} {
        return {name: queue[queueIndex]?.filename ?? "", timestamp: data.elAudio?.currentTime ?? -1, max_timestamp: data.elAudio?.duration ?? -1};
    }

    function performAction(action: Action) {
        if(action.kind === "queue_immediate") {
            const previous_song = getSongNT();
            queue.push(action.song);
            data.play = true;
            
            queueIndex = queue.length - 1;
            data.nowPlaying = queue[queueIndex];
            data.nowPlayingUpdated += 1;

            internalUpdate();
            writeLog({kind: "queue_immediate", opt: "start-playing",
                previous_song,
                next_song: {name: action.song.filename},
            });
        }else if(action.kind === "queue_end") {
            queue.push(action.song);
            internalUpdate();
            writeLog({kind: "queue_end",
                song: {name: action.song.filename},
            });
        }else if(action.kind === "automatic_next") {
            const previous_song = getSongNT();
            data.play = true;
            const did_skip = internalPlayNext();
            internalUpdate();
            writeLog({kind: "automatic_next_2", opt: "start-playing",
                previous_song,
                next_song: {name: getSongNT().name},
                mode: did_skip ? nextmode.value as NextOpsID : "prequeued",
                random_filter: data.filter,
            });
        }else if(action.kind === "skip_fwd") {
            const previous_song = getSongNT();
            data.play = true;
            const did_skip = internalPlayNext();
            internalUpdate();
            writeLog({kind: "skip_fwd_2", opt: "start-playing",
                previous_song,
                next_song: {name: getSongNT().name},
                mode: did_skip ? nextmode.value as NextOpsID : "prequeued",
                random_filter: data.filter,
            });
        }else if(action.kind === "skip_back") {
            const previous_song = getSongNT();
            data.play = true;
            internalPlayPrev();
            internalUpdate();
            writeLog({kind: "skip_back", opt: "start-playing",
                previous_song,
                next_song: {name: getSongNT().name},
            });
        }else if(action.kind === "play") {
            data.play = action.set === "toggle" ? !data.play : action.set;
            internalUpdate();
            writeLog({kind: data.play ? "play" : "pause"});
        }else if(action.kind === "next_mode") {
            nextmode.value = action.set;
        }else if(action.kind === "update_music_array") {
            data.musicUpdated++;
            internalUpdate();
        }else assertNever(action);
    }

    function internalUpdate() {
        musiclist.update();
        nowplaying.update();
        lyricview.update();
        if (data.filter !== prevData.filter) {
            prevData.filter = data.filter;
        }
        const song = data.nowPlaying;
        const artsrc = song && song.tags ? song.tags.arturl || "" : "";
        if (fsimg.src !== artsrc) fsimg.src = artsrc;
    }

    const data: Data = {
        play: true,
        filter: "",
        music: [] as MusicData[],
        musicUpdated: 1,
        nowPlaying: undefined,
        nowPlayingUpdated: 1,
        elAudio: undefined,
        performAction,

        addRootMusic(): void {
            if(isWeb) {
                data.addMusic("/music/");
            } else {
                data.addMusic(path.join(os.homedir(), "Music"));
            }
        },
        addMusic(musicPath: string, depth = 1): void {
            if (depth > config.maxMusicSearchDepth) {
                return;
            } //workaround for circular symlinks
            if(isWeb) {
                if(musicPath.endsWith(".mp3")){
                    // do nothing
                }else{
                    fetch(musicPath, {headers: {"Accept": "application/json"}})
                    .then(a => a.json())
                    .then((list: string[]) => {
                        list.forEach(subpath => data.addMusic(musicPath + "/" + subpath), depth + 1);
                    });
                    return;
                }
            } else {
                const lstat = fs.statSync(musicPath);
                if (lstat.isDirectory()) {
                    return fs
                        .readdirSync(musicPath)
                        .forEach(subPath => data.addMusic(path.join(musicPath, subPath), depth + 1));
                }
            }
            let fileBasename: string;
            if(isWeb) {
                const lao = musicPath.lastIndexOf("/");
                fileBasename = lao === -1 ? musicPath : musicPath.substr(lao + 1);
            }else {
                fileBasename = path.basename(musicPath);
            }
            const song = {
                filename: fileBasename,
                path: musicPath,
                uuid: Symbol(musicPath),
                tags: undefined as any,
            };
            readTags(song.path).then(tags => {
                song.tags = tags;
                data.performAction({kind: "update_music_array"});
            });

            data.music.push(song);
            data.performAction({kind: "update_music_array"});
        },
    };
    const prevData = {
        filter: "",
    };

    if(enableIPC) {
        ipc.config.id = "music";
        //eslint-disable-next-line @typescript-eslint/unbound-method
        ipc.config.logger = (...msg) => console.log(...msg);
        ipc.serve("musicplayer.socket", () => {
            console.log("Server started");
            ipc.server.on("connect", () => {});
            ipc.server.on("message", (ipcmsg, socket) => {
                console.log("IPC Message: ", ipcmsg);
                const mstr = (musc: MusicData) => musc.tags?.artist && musc.tags?.title ? (musc.tags.artist + " - " + musc.tags.title) : musc.filename;
                if(ipcmsg === "next") {
                    performAction({kind: "skip_fwd"});
                    notifier.notify({message: data.nowPlaying ? data.nowPlaying.filename : "Nothing", title: "Musicplayer"});
                }else if(ipcmsg === "prev") {
                    performAction({kind: "skip_back"});
                    notifier.notify({message: data.nowPlaying ? data.nowPlaying.filename : "Nothing", title: "Musicplayer"});
                }else if(ipcmsg === "play") {
                    performAction({kind: "play", set: true});
                }else if(ipcmsg === "pause") {
                    performAction({kind: "play", set: false});
                }else if(ipcmsg === "playpause") {
                    performAction({kind: "play", set: "toggle"});
                    notifier.notify({message: data.play ? "Playing" : "Pausing", timeout: 0.5, title: "Musicplayer"});
                }else if(ipcmsg === "randomfiltertoggle") {
                    const cv = (nextmode.value as NextOpsID) === "random_filter"
                    if(!cv) rfon_prevmode = nextmode.value as NextOpsID;
                    performAction({kind: "next_mode", set: cv ? rfon_prevmode : "random_filter"});
                    notifier.notify({message: cv ? "→ "+nextopts.find(v => v[1] === rfon_prevmode)![0] : "→ Random (Filtered)", timeout: 0.5, title: "Musicplayer"});
                }else if(ipcmsg === "randomfilteron") {
                    performAction({kind: "next_mode", set: "random_filter"});
                }else if(ipcmsg === "randomfilteroff") {
                    performAction({kind: "next_mode", set: "random"});
                }else if(ipcmsg === "listall") {
                    ipc.server.emit(socket, "message", {notice: "handled", results: data.music.map(mstr)});
                    return;
                }else if(ipcmsg === "listqueue") {
                    ipc.server.emit(socket, "message", {notice: "handled", results: queue
                        .filter((a, i) => i > queueIndex - 8)
                        .map(m => m ? mstr(m) : "undefined")
                    });
                    return;
                }else if(ipcmsg === "listnextmodes") {
                    type ResponseMsgType = {notice: "handled"; results: readonly (readonly [string, string])[]};
                    const resmsg: ResponseMsgType = {notice: "handled", results: nextopts};
                    ipc.server.emit(socket, "message", resmsg);
                    return;
                }else if(Array.isArray(ipcmsg) && (ipcmsg[0] === "setnextmode")) {
                    const nnextmode = "" + ipcmsg[1];
                    const nxtmv = nextopts.find(v => v[0] === nnextmode || v[1] === nnextmode);
                    if(!nxtmv) {
                        ipc.server.emit(socket, "message", {notice: "bad request"});
                        notifier.notify({message: "Not Found Next Mode, "+(nxtmv), title: "Musicplayer"});
                        return;
                    }
                    performAction({kind: "next_mode", set: nxtmv[1]});
                    return;
                }else if(Array.isArray(ipcmsg) && (ipcmsg[0] === "playsong" || ipcmsg[0] === "queue")) {
                    const ipcmsg0 = ipcmsg[0] as "playsong" | "queue";
                    const songv = "" + ipcmsg[1];
                    const found = data.music.find(v => mstr(v) === songv || v.filename === songv);
                    if(!found) {
                        ipc.server.emit(socket, "message", {notice: "bad request"});
                        notifier.notify({message: "Not Found Song, "+("" + songv), title: "Musicplayer"});
                        return;
                    }
                    if(ipcmsg0 === "playsong") data.performAction({kind: "queue_immediate", song: found});
                    else if(ipcmsg0 === "queue") data.performAction({kind: "queue_end", song: found});
                    else assertNever(ipcmsg0);
                }else{
                    console.log("bad ipc", ipcmsg);
                    ipc.server.emit(socket, "message", {notice: "bad request"});
                    notifier.notify({message: "Bad IPC, "+("" + ipcmsg), title: "Musicplayer"});
                    return;
                }
                ipc.server.emit(socket, "message", {notice: "handled"});
            });
        });
        ipc.server.start();
    }

    const musiclist = listMusicElem(songlistcol, data);
    const nowplaying = nowPlayingElem(nowPlayingBar, data);
    const lyricview = lyricViewElem(songlyricscol, data);

    internalUpdate();

    let addPanelVisible = false;
    songlistaddbtn.onev("click", () => {
        if (addPanelVisible) return;
        addPanelVisible = true;
        songAddPanel(data, () => {
            addPanelVisible = false;
        });
    });

    songlistsearch.onev("input", () => {
        data.filter = songlistsearch.value;
        internalUpdate();
    });

    return data;
}

type Data = {
    // todo
    // readonly play: boolean
    play: boolean;
    filter: string;
    music: MusicData[];
    musicUpdated: number;
    nowPlaying: MusicData | undefined;
    nowPlayingUpdated: number;
    elAudio: HTMLAudioElement | undefined;

    performAction(action: Action): void;

    addRootMusic(): void;
    addMusic(musicPath: string, depth?: number): void;
};

function lyricViewElem(parent: HTMLElement, data: Data) {
    const defer = makeDefer();
    const nowPlayingLyrics = el("div")
        .clss(".nowplaying_lyrics.vgrid")
        .adto(parent)
        .drmv(defer);

    const buttonbar = el("div").adto(nowPlayingLyrics);
    const editButton = el("button")
        .clss("lyricsedtr-button")
        .atxt("…")
        .adto(buttonbar);
    const timeButton = el("button")
        .clss("lyricsedtr-button unimportant")
        .atxt("…")
        .adto(buttonbar);
    const lyricContainer = el("div").atxt("…").adto(
        el("p")
            .clss("lyrics")
            .adto(nowPlayingLyrics),
    );

    const prevData = {
        lyrics: undefined as any,
        allowEdit: undefined as any,
        timing: undefined as any,
    };

    let lyricsEditorVisible = false;

    editButton.onev("click", e => {
        e.stopPropagation();
        if (!data.nowPlaying || !data.nowPlaying.tags || lyricsEditorVisible) {
            return; // nope.
        }
        lyricsEditorVisible = true;
        showLyricsEditor(data.nowPlaying, data.nowPlaying.tags, () => {
            lyricsEditorVisible = false;
            data.performAction({kind: "update_music_array"});
        });
    });
    timeButton.onev("click", () => {
        // before each line, put a blank spot. at the top line, have it show the time of the media player.
        // when you click a line, set its time to the time of the current media player time
        // then go to the next line
        // you can click further than the next line or something
        // also skip lines starting with [ or __FAVORITE__ or blank
        //
        alert("TODO!");
    });
    
    function refillLyrics(lyrics: string) {
        lyricContainer.innerHTML = "";
        for(const line of lyrics.split("\n")) {
            const dv = el("div").clss("lyricline").atxt(line).adto(lyricContainer).adch(el("br"));
            dv.onev("click", () => {
                // TODO jump to time code
                // const ct = data.elAudio!.currentTime;
                // dv.prepend(el("span").atxt("" + ct));
            });
        }
    }

    const res = {
        update() {
            const thisLyrics = data.nowPlaying
                ? data.nowPlaying.tags
                    ? data.nowPlaying.tags.lyrics || "undefined"
                    : "…"
                : "Not playing";
            if (thisLyrics !== prevData.lyrics) {
                prevData.lyrics = thisLyrics;
                refillLyrics(thisLyrics);
            }
            let allowEdit = false;
            if (data.nowPlaying && data.nowPlaying.tags) {
                allowEdit = true;
            }
            if (allowEdit !== prevData.allowEdit) {
                prevData.allowEdit = allowEdit;
                editButton.disabled = !allowEdit;
                if (allowEdit) {
                    editButton.textContent = "Edit!";
                    timeButton.textContent = "Time";
                } else {
                    editButton.textContent = "…";
                    timeButton.textContent = "…";
                }
            }
        },
    };
    return res;
}

function oneListItem(ul: HTMLUListElement, data: Data, song: MusicData): OneListItem {
    const defer = makeDefer();

    const li = el("li")
        .attr({ role: "button", tabindex: "0" })
        .onev("click", e => {
            e.stopPropagation();
            data.performAction({kind: "queue_immediate", song});
        })
        .adto(ul);

    const img = el("img")
        .clss("icon")
        .adto(li);
    const title = txt("").adto(el("span").adto(li));

    el("button")
        .adto(
            el("div")
                .adto(li)
                .clss("itembuttons"),
        )
        .atxt("+")
        .attr({ title: "queue" })
        .onev("click", e => {
            e.stopPropagation();
            data.performAction({kind: "queue_end", song});
            spawnParticle(e.clientX, e.clientY, "+");
        });

    const prevData = {
        playing: Symbol() as any,
        visible: Symbol() as any,
        tags: Symbol() as any,
    };

    const res: OneListItem = {
        remove() {
            defer.cleanup();
        },
        update() {
            // only do the filter if song or data.filter is changed
            const playing = data.nowPlaying === song;
            const visible = playlistFilter(song, data.filter);

            if (visible !== prevData.visible) {
                li.classList.toggle("playlist_hide", !visible);
                if (!visible) return;
            }

            if (playing !== prevData.playing) {
                prevData.playing = playing;
                li.attr({ "aria-pressed": "" + playing });
                li.classList.toggle("playing", playing);
            }

            if (song.tags !== prevData.tags) {
                prevData.tags = song.tags;

                const imgsrc = song.tags ? song.tags.arturl || "" : "";
                if (img.src !== imgsrc) img.src = imgsrc;

                const newtxt =
                    song.tags && song.tags.title && song.tags.artist
                        ? " " + song.tags.artist + " - " + song.tags.title
                        : " " + song.filename;
                if (title.nodeValue !== newtxt) title.nodeValue = newtxt;

                if (song.tags && song.tags.color) {
                    li.styl({
                        "--track-foreground": song.tags.color.dark,
                        "--track-background": song.tags.color.light,
                    });
                } else {
                    li.styl({ "--track-foreground": "#fff", "--track-background": "#000" });
                }
            }
        },
    };
    return res;
}

type OneListItem = {
    remove(): void;
    update(): void;
};

function listMusicElem(parent: HTMLElement, data: Data) {
    const prevData = {
        filter: Symbol() as any,
        musicUpdated: Symbol() as any,
        currentlyPlaying: Symbol() as any,
    };

    const defer = makeDefer();
    const songlistul = el("ul")
        .adto(parent)
        .clss("songlist")
        .drmv(defer);

    const lis: { sng: MusicData; oli: OneListItem }[] = []; // atm there is no way to remove things so this is fine for now
    
    const currentlyLoadingSongs = el("li").adto(songlistul).atxt("Loading ");
    const clsTn = txt("…").adto(currentlyLoadingSongs);
    currentlyLoadingSongs.atxt(" more.");

    const res = {
        remove() {
            for (const itm of lis) {
                itm.oli.remove();
            }
            defer.cleanup();
        },
        update() {
            if (
                data.filter === prevData.filter &&
                data.musicUpdated === prevData.musicUpdated &&
                data.nowPlaying === prevData.currentlyPlaying
            ) {
                return; // nothing changed
            }
            prevData.filter = data.filter;
            prevData.musicUpdated = data.musicUpdated;
            prevData.currentlyPlaying = data.nowPlaying;

            let loadingCount = 0;
            for (const [i, song] of data.music.entries()) {
                if(!song.tags) loadingCount += 1;
                if (!lis[i]) {
                    lis[i] = { sng: song, oli: oneListItem(songlistul, data, song) };
                }
                if (lis[i].sng !== song) {
                    throw new Error("bad state. song list is not supposed to have items removed.");
                    // todo key based thing instead (song.path doesn't work so maybe a unique id / a set if that can do it)
                }
                lis[i].oli.update();
            }
            clsTn.nodeValue = "" + loadingCount;
            currentlyLoadingSongs.classList.toggle("hidden", loadingCount === 0);
        },
    };
    return res;
}

const mpmount = el("div").clss("emp-mount").adto(body);

const musicPlayer = MusicPlayer(mpmount);

const savedregex = { regex: new RegExp(""), text: "" };

const playlistFilter = (song: MusicData, filterStr: string) => {
    let searchdata = song.filename;
    if (song.tags) {
        const hasArt = !!song.tags.artdata;
        searchdata += ` ${"" + song.tags.title} ${"" + song.tags.artist} ${"" + song.tags.lyrics} ${
            hasArt ? "__HAS_ART" : "__NO_ART"
        }`;
    }

    const searchValue = filterStr;
    if (searchValue.startsWith("!")) {
        return searchdata.includes(searchValue.substr(1));
    }
    if (searchValue.startsWith("/")) {
        if (savedregex.text !== searchValue) {
            savedregex.text = searchValue;
            savedregex.regex = new RegExp(searchValue.substr(1));
        }
        return savedregex.regex.exec(searchdata) != null;
    }

    searchdata = searchdata.toLowerCase();

    const searchTerm = searchValue.toLowerCase();
    return searchTerm
        .split(" ")
        .every(i => (searchdata.includes(i) ? ((searchdata = searchdata.replace(i, "")), true) : false));
};

class Mutex {
    mutex: Promise<void>
    constructor() {
        this.mutex = Promise.resolve();
    }

    lock(): PromiseLike<() => void> {
        let begin: (unlock: () => void) => void = () => {};

        this.mutex = this.mutex.then(() => {
            return new Promise(begin);
        });

        return new Promise(res => {
            begin = res;
        });
    }
}

const readTagsLock = new Mutex();
async function readTags(filename: string) {
    const unlock = await readTagsLock.lock();
    let result: SongTags;
    try {
        if(isWeb) {
            const webres = await fetch("/tags"+realEncodeURI(filename));
            const wrjson = await webres.json();
            if(wrjson.error) throw new Error("Load fail: "+wrjson.error);
            result = wrjson.value;
        }else{
            result = await readTagsNoLock(filename);
        }
    }catch(e) {
        unlock();
        throw new Error("Read tags error on "+filename);
    }
    unlock();
    return result;
}

// load music

musicPlayer.addRootMusic();
musicPlayer.performAction({kind: "automatic_next"});

function nowPlayingElem(nowPlayingBar: HTMLElement, data: Data) {
    const defer = makeDefer();

    const artEl = el("img")
        .clss("nowplaying_art")
        .adto(nowPlayingBar)
        .drmv(defer);
    const btnPrev = el("button")
        .clss(".previous.menubtn")
        .adto(nowPlayingBar)
        .drmv(defer)
        .adch(
            el("span")
                .atxt("\ue801")
                .clss(".fonticon.skipback"),
        );
    const btnPlaypause = el("button")
        .clss(".playpause.menubtn")
        .adto(nowPlayingBar)
        .drmv(defer)
        .adch(
            el("span")
                .atxt("\ue800")
                .clss(".fonticon.btnplay"),
        )
        .adch(
            el("span")
                .atxt("\ue803")
                .clss(".fonticon.btnpause"),
        );
    const btnNext = el("button")
        .clss(".skip.menubtn")
        .adto(nowPlayingBar)
        .drmv(defer)
        .adch(
            el("span")
                .atxt("\ue802")
                .clss(".fonticon.skipfwd"),
        );

    const nowPlayingvgrid = el("div")
        .clss("verticallist")
        .adto(nowPlayingBar)
        .drmv(defer);
    const nowPlayingTitle = txt("...").adto(
        el("div")
            .clss(".vlitem.nowplaying_title")
            .adto(nowPlayingvgrid),
    );
    const nowPlayingArtist = txt("...").adto(
        el("div")
            .clss(".vlitem.nowplaying_artist")
            .adto(nowPlayingvgrid),
    );
    const nowPlayingFilename = txt("...").adto(
        el("div")
            .clss(".vlitem.nowplaying_filename")
            .adto(nowPlayingvgrid),
    );
    const elAudio = el("audio")
        .adto(nowPlayingBar)
        .drmv(defer);
        data.elAudio = elAudio;

    const prev = {
        nowPlaying: undefined as any,
        nowPlayingTags: undefined as any,
        nowPlayingUpdated: undefined as any, // incremented on skip fwd eg
    };

    function updateNowPlayingBar() {
        const song = data.nowPlaying;
        nowPlayingTitle.nodeValue = song && song.tags ? song.tags.title || "undefined" : "…";
        nowPlayingArtist.nodeValue = song && song.tags ? song.tags.artist || "undefined" : "…";
        nowPlayingFilename.nodeValue = song ? song.filename : "Not Playing";
        const artsrc = song && song.tags ? song.tags.arturl || "" : "";
        if (artEl.src !== artsrc) artEl.src = artsrc;

        if (song && song.tags && song.tags.color) {
            document.documentElement.style.setProperty("--foreground", song.tags.color.light);
            document.documentElement.style.setProperty("--background", song.tags.color.dark);
            document.documentElement.style.setProperty("--background2", "#000");
        } else {
            document.documentElement.style.setProperty("--foreground", "#fff");
            document.documentElement.style.setProperty("--background", "#333");
            document.documentElement.style.setProperty("--background2", "#000");
        }
    }

    const res = {
        remove() {
            defer.cleanup();
        },
        update() {
            if (data.nowPlayingUpdated !== prev.nowPlayingUpdated) {
                prev.nowPlayingUpdated = data.nowPlayingUpdated;
                elAudio.src = realEncodeURI(data.nowPlaying ? data.nowPlaying.path || "" : "");
                elAudio.play();
            }
            if (
                data.nowPlaying !== prev.nowPlaying ||
                (data.nowPlaying || { tags: undefined }).tags !== prev.nowPlayingTags
            ) {
                prev.nowPlaying = data.nowPlaying;
                prev.nowPlayingTags = (data.nowPlaying || { tags: undefined }).tags;
                updateNowPlayingBar();
            }

            if (data.play !== !elAudio.paused) {
                if (data.play) {
                    if(data.nowPlaying) elAudio.play();
                } else {
                    elAudio.pause();
                }
            }
            if (data.play !== btnPlaypause.classList.contains("play")) {
                btnPlaypause.classList.toggle("play", data.play);
            }
        },
    };
    btnPlaypause.onev("click", e => {
        e.stopPropagation();
        data.performAction({kind: "play", set: "toggle"});
    });

    elAudio.onev("ended", () => {
        data.performAction({kind: "automatic_next"});
    });
    elAudio.onev("pause", () => {data.play = false;});
    elAudio.onev("play", () => {data.play = true;});

    btnNext.addEventListener("click", (e /*: MouseEvent*/) => {
        e.stopPropagation();
        data.performAction({kind: "skip_fwd"});
    });
    
    btnPrev.addEventListener("click", (e /*: MouseEvent*/) => {
        e.stopPropagation();
        data.performAction({kind: "skip_back"});
    });

    return res;
}

function randomOfArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function showLyricsEditor(song: MusicData, songtags: SongTags, onclose: () => void) {
    const defer = makeDefer();
    defer(() => onclose());

    mpmount.style.display = "none";
    defer(() => mpmount.style.display = "");

    const win = el("div")
        .adto(body)
        .clss(".lyricsedtr.vgrid.maxhv")
        .drmv(defer);

    win.setAttribute("style", document.documentElement.getAttribute("style") || "");

    const fylnmehdng = el("h1").adto(win);

    const albumArt = el("img")
        .adto(win)
        .clss("lyricsedtr-img")
        .attr({ src: songtags.arturl })
        .adto(fylnmehdng);
    fylnmehdng.atxt(song.filename);

    const setEnabled = (v: boolean) => {
        btncancel.disabled = !v;
        btnsave.disabled = !v;
        txtarya.disabled = !v;
        titlenput.disabled = !v;
        artistnput.disabled = !v;
        arturlfetchbtn.disabled = !v;
    };

    const btnrow = el("div")
        .clss(".hgrid")
        .adto(win);

    const btnsave = el("button")
        .adto(btnrow)
        .atxt("Save")
        .clss("lyricsedtr-button")
        .onev("click", () => {
            setEnabled(false);
            btncancel.disabled = true;
            btnsave.disabled = true;
            btnsave.textContent = "Saving...";
            writeLog({kind: "update_song_meta",
                song: {name: song.path},
                meta_prev: {lyrics: song.tags?.lyrics ?? "undefined", title: song.tags?.title ?? "undefined", artist: song.tags?.artist ?? "undefined"},
                meta_next: {lyrics: txtarya.value, title: titlenput.value, artist: artistnput.value}
            });

            let atchmntnme = "";
            if (imgset) {
                atchmntnme = "/tmp/" + imgset.egname;
                fs.writeFileSync(atchmntnme, imgset.buffer);
            } else if (songtags.artdata) {
                atchmntnme = "/tmp/" + "__CONTINUE." + songtags.artdata.fmt;
                fs.writeFileSync(atchmntnme, Buffer.from(songtags.artdata.b64, "base64"));
            }

            // song.path
            ffmetadata.write(
                song.path,
                {
                    album: txtarya.value,
                    title: titlenput.value,
                    artist: artistnput.value,
                },
                // { attachments: ["/tmp/icon.png"] },
                atchmntnme ? { attachments: [atchmntnme] } : {},
                err => {
                    if (err) {
                        btnsave.textContent = "Save";
                        setEnabled(true);
                        console.log(err);
                        alert("" + err);
                    } else {
                        if (song.tags) {
                            song.tags = { ...song.tags };
                            song.tags.lyrics = txtarya.value;
                            song.tags.title = titlenput.value;
                            song.tags.artist = artistnput.value;
                            if (imgset) {
                                song.tags.artdata = {fmt: imgset.fmt, b64: imgset.buffer.toString("base64")};
                                song.tags.arturl = getArtURL(song.tags);
                                song.tags.color = imgset.colors;
                            }
                        }
                        defer.cleanup();
                    }
                },
            );
        });

    const btncancel = el("button")
        .adto(btnrow)
        .atxt("Cancel")
        .clss("lyricsedtr-button.unimportant")
        .onev("click", () => {
            defer.cleanup();
        });

    const cols = el("div").clss("columns").adto(win);
    const col1 = el("div").clss(".column.vgrid").adto(cols);
    const col2 = el("div").clss(".column").adto(cols);

    const titlegroup = el("div").adto(col1);
    el("h2")
        .adto(titlegroup)
        .atxt("Title");

    const [defaultArtist, defaultTitle] = song.filename.replace(".mp3", "").split(" - ");

    const titlenput = el("input")
        .adto(el("div").adto(titlegroup))
        .attr({ placeholder: "Title..." })
        .clss("lyricsedtr-input")
        .dwth(v => (v.value = songtags.title || defaultTitle));

    const authorgroup = el("div").adto(col1);

    el("h2")
        .adto(authorgroup)
        .atxt("Author");

    const artistnput = el("input")
        .adto(el("div").adto(authorgroup))
        .attr({ placeholder: "Author..." })
        .clss("lyricsedtr-input")
        .dwth(v => (v.value = songtags.artist || defaultArtist));

    const artgroup = el("div").adto(col1);
    el("h2")
        .adto(artgroup)
        .atxt("Art");

    const arturlbox = el("div")
        .adto(artgroup)
        .clss("lyricsedtr-hbox");
    const arturlinput = el("input")
        .adto(arturlbox)
        .attr({ placeholder: "URL..." })
        .clss("lyricsedtr-input");
    const arturlfetchbtn = el("button")
        .adto(arturlbox)
        .atxt("Fetch")
        .onev("click", () => arturlfetch())
        .clss("lyricsedtr-button");

    function updateFetchBtn(on: boolean) {
        arturlfetchbtn.disabled = !on;
        arturlfetchbtn.textContent = on ? "Fetch" : "Fetching…";
    }

    function arturlfetch() {
        updateFetchBtn(false);
        const urlv = arturlinput.value;
        fetch(urlv)
        .then(fs1 => {
            fs1.buffer()
            .then(fs2 => {
                setImage(fs2, urlv.substr(urlv.lastIndexOf(".") + 1));
                updateFetchBtn(true);
            })
            .catch(e => {
                alert(e.stack);
                updateFetchBtn(false);
            });
        })
        .catch(e => {
            alert(e.stack);
            updateFetchBtn(false);
        });
    }

    const lyrixgrup = el("div").adto(col1);
    el("h2")
        .adto(lyrixgrup)
        .atxt("Lyrics");

    let imgset: { url: string; buffer: Buffer; egname: string; colors: ColorProperty; fmt: string } | undefined;

    function setImage(newimg: Buffer, format: string) {
        const srcval = "data:image/" + format + ";base64," + newimg.toString("base64");
        getDarkLight(isWeb ? srcval : newimg)
        .then(res => {
            albumArt.src = srcval;
            win.style.setProperty("--background", res.dark);
            win.style.setProperty("--foreground", res.light);
            imgset = {
                url: srcval,
                buffer: newimg,
                egname: "__TEMPIMAGE." + format,
                fmt: format,
                colors: res,
            };
        })
        .catch(e => alert(e.stack));
    }

    const lyricsearcharea = el("div").adto(lyrixgrup);
    const lspanel: LyricSearchPanel = lyricSearchPanel(
        lyricsearcharea,
        artistnput.value.split(" · ")[0] + " - " + titlenput.value.split(" · ")[0],
        updnfo => {
            txtarya.value = updnfo.lyrics;
            if (updnfo.image) setImage(updnfo.image.buffer, updnfo.image.format);
            console.log(updnfo);
        },
    );
    defer(() => lspanel.close());

    const txtarya = el("textarea")
        .adto(el("div").clss("h100").adto(col2))
        .attr({ placeholder: "Lyrics..." })
        .clss("lyricsedtr-input.h100")
        .dwth(v => (v.value = "" + songtags.lyrics));
}

type LyricResult = {
    image?: { buffer: Buffer; format: string };
    lyrics: string;
};

type LyricSearchPanel = { close: () => void };
function lyricSearchPanel(
    mount: HTMLElement,
    startSearch: string,
    update: (lres: LyricResult) => void,
): LyricSearchPanel {
    const defer = makeDefer();
    const resv = { close: () => defer.cleanup() };

    if (!lyricsClients) {
        alert("No secret!");
        return resv;
    }

    const page = el("div")
        .clss("vgrid")
        .adto(mount)
        .drmv(defer);

    const searchBox = el("div")
        .adto(page)
        .clss("lyricsedtr-hbox");
    const searchTerm = el("input")
        .adto(searchBox)
        .clss("lyricsedtr-input")
        .dwth(v => (v.value = startSearch));
    const searchGoBtn = el("button")
        .atxt("Search!")
        .adto(searchBox)
        .clss("lyricsedtr-button");
    const resultsArea = el("ul")
        .clss("lyricsedtr-searchresults")
        .adto(page);

    function updateSearchResults(newResults: GeniusSong[]) {
        resultsArea.innerHTML = "";
        for (const { result } of newResults) {
            const itmnfo = el("li").adto(resultsArea);
            el("img")
                .adto(itmnfo)
                .attr({ src: result.song_art_image_thumbnail_url })
                .clss("icon")
                .attr({ style: "visibility: visible" });
            itmnfo.atxt(" " + result.full_title + " ");

            const usebtn = el("button")
                .adto(itmnfo)
                .clss("lyricsedtr-button")
                .atxt("Use");
            usebtn.onev("click", () => {
                usebtn.disabled = true;
                usebtn.innerText = "Downloading…";
                (async () => {
                    const [{ lyrics }, image] = await Promise.all([
                        lyricsClients!.lyricist.song(result.id, {
                            fetchLyrics: true,
                        }),
                        (async () => {
                            return await (await fetch(result.song_art_image_url)).buffer();
                        })().catch(() => undefined),
                    ]);

                    update({
                        lyrics,
                        image: image
                            ? {
                                  buffer: image,
                                  format: result.song_art_image_url.substr(
                                      result.song_art_image_url.lastIndexOf(".") + 1,
                                  ),
                              }
                            : undefined,
                    });

                    usebtn.disabled = false;
                    usebtn.innerText = "Use";
                })().catch(e => {
                    usebtn.disabled = false;
                    usebtn.innerText = "Use";
                    alert(e.stack);
                });
            });
        }
    }

    searchGoBtn.onev("click", () => dosearch());
    searchBox.onev("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            return dosearch();
        }
    });

    const dosearch = () => {
        if (searchGoBtn.disabled) return;
        searchGoBtn.disabled = true;
        searchGoBtn.innerText = "Searching…";
        (async () => {
            const results: string = await new Promise((r, re) =>
                lyricsClients!.genius.search(searchTerm.value, (e: any, v: any) => (e ? re(e) : r(v))),
            );
            const prsdreslts: any = JSON.parse(results);
            console.log(prsdreslts);
            const hits = prsdreslts.response.hits;
            const choices = hits.slice(0, 25) as GeniusSong[];
            updateSearchResults(choices);
            searchGoBtn.disabled = false;
            searchGoBtn.innerText = "Search!";
        })().catch(e => {
            console.log(e);
            searchGoBtn.disabled = false;
            searchGoBtn.innerText = "Search!";
            resultsArea.innerHTML = "";
            el("code")
                .adto(el("pre").adto(resultsArea))
                .atxt(e.stack);
        });
    };

    return resv;
}
type GeniusSong = {
    result: {
        full_title: string;
        song: string;
        song_art_image_thumbnail_url: string;
        song_art_image_url: string;
        id: number;
    };
};

function assertNever(a: never): never {
    throw new Error("never: "+a);
}

function joinBetween<T, U>(a: T[], v: U): (T | U)[] {
    const res: (T | U)[] = [];
    a.forEach((item, i) => {
        if(i !== 0) res.push(v);
        res.push(item);
    })
    return res;
}

function songAddPanel(outerData: Data, onclose: () => void) {
    const defer = makeDefer();

    mpmount.style.display = "none";
    defer(() => mpmount.style.display = "");

    const mainel = el("div")
        .clss(".lyricsedtr.vgrid") // TODO rename
        .adto(body)
        .drmv(defer);

    const close = () => {
        defer.cleanup();
        onclose();
    };
    
    type TabName = "ytdl" | "file";
    type ExecData = string[];
    const setTab = (tabName: TabName) => {
        data.from.active = tabName;
        rerender();
    }
    const data = {
        from: {
            active: "ytdl" as TabName,
            ytdl: {videoid: ""},
            file: {filepath: ""},
        },
        tempo: "",
        title: "",
        executing: false as false | ExecData,
        allowCloseExecuting: false,
    };
    
    async function execRun() {
    
        const execarr: string[] = [];
        data.executing = execarr;
        data.allowCloseExecuting = false;
        rerender();
        
        const {cmds, errs} = getcmds();
        if(errs.length) {
            execarr.push("Failed: "+errs.join(", "));
            data.allowCloseExecuting = true;
            rerender();
            
            return;
        }

        const tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "musicplayer-"));
        console.log(tmpdir);
        
        async function cleanup() {
            // console.log("note: {recursive: true} is only available past node v12.10.0", process.versions.node);
            // await fs.promises.rmdir(tmpdir, {recursive: true});
            child_process.spawnSync("rm", ["-rf", tmpdir]);
        }

        for(const [pnme, ...args] of cmds) {
            execarr.push([pnme, ...args].join(" "));
            rerender();
            const spawned = child_process.spawn(pnme, args, {cwd: tmpdir});
            let activeTextBit: string | undefined = undefined;
            function writeTextBit(_stdv: string, textbit: string) {
                for(const char of textbit.split("")) {
                    if(activeTextBit === undefined) {
                        execarr.push("");
                        activeTextBit = "";
                    }
                    if(char === "\n") {
                        activeTextBit = undefined;
                    }else if(char === "\r") {
                        activeTextBit = "";
                    }else{
                        activeTextBit += char;
                        execarr[execarr.length - 1] = activeTextBit;
                    }
                }
            }
            spawned.stdout.on("data", rv => {
                writeTextBit("stdout", rv.toString());
                rerender();
            });
            spawned.stderr.on("data", rv => {
                writeTextBit("stderr", rv.toString());
                rerender();
            });
            const rescode = await new Promise(r => {spawned.addListener("close", (code) => {
                r(code);
            })});
            if(rescode !== 0) {
                execarr.push("Command failed with error code "+rescode);
                
                execarr.push("Removing intermediates...");
                rerender();
                await cleanup();
                
                execarr.push("Failed");
                data.allowCloseExecuting = true;
                rerender();
                
                return;
            }
        }
        
        execarr.push("Removing intermediates...");
        rerender();
        await cleanup();
        
        execarr.push("Done");
        rerender();
        
        outerData.addMusic(getDistPath());
        defer.cleanup();
        onclose();
    }
    
    function exec() {
        if(data.executing && !data.allowCloseExecuting) return;
        execRun().catch((e) => {
            data.allowCloseExecuting = true;
            (data.executing as string[]).push(e.toString());
            rerender();
        })
    }

    function getDistPath() {
        const titlesafe = data.title.split("/").join("⌿");
        return path.join(os.homedir(), "Music", titlesafe+".mp3");
    }
    function getcmds() {
        const missing: string[] = [];
        const rescmd: string[][] = [];
        rescmd.push(["[", "!", "-f", getDistPath(), "]"]);
        if(data.from.active === "ytdl") {
            const videoid = data.from.ytdl.videoid;
            rescmd.push(["youtube-dl", videoid, "--user-agent", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "--extract-audio", "--audio-format", "mp3", "-o", `dnl0."%(ext)s"`]);
            if(!videoid) missing.push("ytdl website");
            if(videoid.startsWith("-")) missing.push("ytdl website starts with '-'");
        }else if(data.from.active === "file") {
            rescmd.push(["cp", data.from.file.filepath, "dnl0.mp3"]);
            if(!data.from.file.filepath) missing.push("file not chosen");
        }else{
            assertNever(data.from.active);
        }

        if(+data.tempo > 1) {
            rescmd.push(["sox", "dnl0.mp3", "dnl1.mp3", "tempo", "" + (+data.tempo)]);
        }else if(+data.tempo === 1){
            rescmd.push(["mv", "dnl0.mp3", "dnl1.mp3"]);
        }else{
            missing.push("playback rate not set or is below 1");
        }
        
        if(!data.title) missing.push("title not set");
 
        rescmd.push(["mv", "dnl1.mp3", getDistPath()]);

        return {cmds: rescmd, errs: missing};
    }

    // prettier-ignore
    const rndr = (cmdsv: {cmds: string[][]; errs: string[]}) => html`
        <h1>Add Song</h1>
        <div class="hlist">
            <button disabled=${cmdsv.errs.length || (data.executing && !data.allowCloseExecuting) ? "" : undefined} class="lyricsedtr-button" onclick=${exec}>${data.executing ? data.allowCloseExecuting ? "↺ Retry" : "..." : "+ Add"}</button>
            <button disabled=${data.executing && !data.allowCloseExecuting ? "" : undefined} class="lyricsedtr-button unimportant" onclick=${close}>Cancel</button>
        </div>
        ${data.executing ? html`
            <div class="hlist">
                <button class="lyricsedtr-button" disabled=${data.allowCloseExecuting ? undefined : ""} onclick=${() => {data.executing = false; rerender();}}>Edit</button>
            </div>
            <div class="cmdline">${data.executing.map((v) => html`<div>Out: <code>${v}</code></div>`)}</div>
        ` : html`
            <h2>File:</h2>
            <div class="tablist">
                <button class=${"lyricsedtr-button"+(data.from.active === "ytdl" ? "" : " unimportant")} onclick=${() => setTab("ytdl")}>youtube-dl</button>
                <button class=${"lyricsedtr-button"+(data.from.active === "file" ? "" : " unimportant")} onclick=${() => setTab("file")}>Local File</button>
            </div>
            ${data.from.active === "ytdl" ? html`
                <h2>Website:</h2>
                <div>
                    <input type="text" placeholder="https://…" class="lyricsedtr-input" value=${data.from.ytdl.videoid} oninput=${(e: any) => {data.from.ytdl.videoid = e.currentTarget.value; rerender();}} />
                </div>
            ` : data.from.active === "file" ? html`
                <div>
                    <input type="file" onchange=${(e: any) => {data.from.file.filepath = e.currentTarget.files[0].path; rerender();}} />
                </div>
            ` : assertNever(data.from.active)}
            <h2>Speed:</h2>
            <div>
                <label>Playback Rate: <input required placeholder="1.0" type="text" class="lyricsedtr-input" value=${data.tempo} style="width: auto;" oninput=${(e: any) => {data.tempo = e.currentTarget.value; rerender();}} /></label>
            </div>
            <h2>Title:</h2>
            <div>
                <input type="text" placeholder="Artist · Another - Song Title" class="lyricsedtr-input" value=${data.title} oninput=${(e: any) => {data.title = e.currentTarget.value; rerender();}} />
            </div>
            ${cmdsv.errs.length ? html`
                <h2>Errors:</h2>
                <ul>${cmdsv.errs.map(err => html`<li>${err}</li>`)}</ul>
            ` : html`
                <h2>Command:</h2>
                <code>${cmdsv.cmds.map(part => html`<div class="cmdline">${joinBetween(part.map(cmdbit => html`<span class="cmdpart">${cmdbit}</span>`), html` ${" "}`)}</div>`)}</code>
            `}
        `}`;
    // we need a custom version of join that just adds the part in. arrayJoin([1, 2, 3], () => 0) eg would make [1, 0, 2, 0, 3]
    const rerender = () => {
        render(mainel, rndr(getcmds()));
    };

    rerender();

    const res = {
        render() {
            rerender();
        },
    };
    return res;
}

/*
const holder = document;

holder.ondragover = () => {
    return false;
};

holder.ondragleave = () => {
    return false;
};

holder.ondragend = () => {
    return false;
};

holder.ondrop = e => {
    e.preventDefault();

    if (!e.dataTransfer) {
        console.log("No datatransfer");
        alert("no datatransfer");
        return;
    }
    console.log("Adding", e.dataTransfer.files.length, "files.");
    Array.from(e.dataTransfer.files).forEach(f => musicPlayer.addMusic((f as any).path));

    return false;
};
*/
