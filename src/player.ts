import { $scss } from "./qdom";
import { hack } from "./App";
import "./_stdlib";

hack();

const config = {
    minContrast: 5.0,
    constrastStepChange: 0.25, // How quickly to change background and foreground colors when fixing contrast,
    lightMode: false,
    updateSpeedLimit: 1000, // Minimum ms allowed between each update of the music list. Higher means songs update in larger groups.
    maxMusicSearchDepth: 10, // Max search depth of folders in music added
};

import * as fs from "fs"; // .promises
import * as os from "os";
import * as path from "path";
//@ts-ignore
import Color_ from "color";
//@ts-ignore
import * as mm from "music-metadata";
//@ts-ignore
import * as Vibrant from "node-vibrant";
//@ts-ignore
import * as ffmetadata_ from "ffmetadata";
import fetch from "node-fetch";
const Lyricist = (window as any)["require"]("lyricist");
const Genius = (window as any)["require"]("node-genius");

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
.verticallist {
	display: flex;
	flex-flow: column;
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
	position: absolute;
	z-index: 10;
    width: 100%;
    box-sizing: border-box;
    
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

@media screen and (max-width: 600px) {
	.columns {
        grid-template-columns: 1fr;
	}
}

.nowplaying_art {
	width: 60px;
	height: 60px;
}
.icon {
	width: 20px;
	height: 20px;
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
body > div {
	padding: 20px;
}
::-webkit-scrollbar {
	width: 4px;
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
li.playing {
	background-color: var(--background);
}
li:hover {
	background-color: var(--track-foreground);
	color: var(--track-background);
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
.lyricsedtr {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    box-sizing: border-box;
    overflow-y: scroll;
    z-index: 20;
    background-color: var(--background);
    color: var(--foreground);
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
    margin-bottom: 10px;
    vertical-align: middle;
    border-radius: 10px;
    border: 3px solid var(--foreground);
}
textarea.lyricsedtr-input {
    padding: 10px;
}
.lyricsedtr-searchresults {
    margin-bottom: 10px;
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
    &:hover {
        box-shadow: inset 0 0 50px -30px var(--background);
    }
    &:focus {
        box-shadow: inset 0 0 50px -100px var(--background);
    }
}
.lyricsedtr-hbox {
    display: grid;
    gap: 10px;
    margin-bottom: 10px;
    grid-template-columns: 1fr max-content;
    & > button {
        margin: 0;
    }
}
.lyricsedtr-button {
    background-color: var(--foreground);
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    color: var(--background);
    box-shadow: 0 1px 10px -3px var(--foreground);
    margin-right: 10px;
    border-radius: 5px;
    transition: 0.1s box-shadow;
    vertical-align: middle;
    &:hover {
        box-shadow: 0 0 10px 0 var(--foreground);
        cursor: pointer; /* too bad */
    }
    &.lyricsedtr-button-cancel {
        background-color: var(--background);
        color: var(--foreground);
        box-shadow: none;
        &:hover {
            box-shadow: 0 0 10px -3px var(--foreground);
        }
    }
}
.lyrics {
    white-space: pre-wrap;
}
`;

let lastList = 0;
let llTimeout: NodeJS.Timeout;

function spawnParticle(x: number, y: number, text: string) {
    el("div")
        .clss("particle")
        .styl({ "--x": x + "px", "--y": y + "px" })
        .atxt(text)
        .adto(body)
        .dwth(v => setTimeout(() => v.remove(), 1000));
}

type Color = {
    hex: () => string;
    contrast: (other: Color) => number;
    darken: (step: number) => Color;
    lighten: (step: number) => Color;
};
const Color: (hex: string) => Color = Color_;
type ColorProperty = {
    dark: Color;
    light: Color;
};
type SongTags = {
    title?: string;
    album?: string;
    picture?: { format: string; data: Buffer }[];
    art: string;
    artist?: string;
    color?: ColorProperty;
};
type MusicData = {
    filename: string;
    path: string;
    uuid: symbol;
    tags: SongTags | undefined;
};

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
        .clss("column")
        .adto(cols);
    const songlistsearch = el("input")
        .clss(".search.lyricsedtr-input")
        .adto(songlistcol)
        .attr({ type: "text", placeholder: "Search..." });
    const songlyricscol = el("div")
        .clss("column")
        .adto(cols);

    const queue: (MusicData | undefined)[] = [];
    let queueIndex = 0;

    function setQueueIndex(envy: number) {
        queueIndex = envy;
        while (queueIndex < 0) {
            queue.unshift(undefined);
            queueIndex += 1;
        }
        if (!queue[queueIndex]) queue[queueIndex] = randomOfArray(data.music);
        data.nowPlaying = queue[queueIndex];
        data.nowPlayingUpdated += 1;
        data.update();
    }

    const data: Data = {
        play: true,
        filter: "",
        music: [] as MusicData[],
        musicUpdated: 1,

        nowPlaying: undefined,
        nowPlayingUpdated: 1,

        queueImmediate(song: MusicData) {
            queue.push(song);
            setQueueIndex(queue.length - 1);
        },
        queueFinal(song: MusicData) {
            queue.push(song);
            data.update();
        },
        addQueue(diff: number) {
            setQueueIndex(queueIndex + diff);
        },
        playNext() {
            data.play = true;
            setQueueIndex(queueIndex + 1);
        },
        addMusic(musicPath: string, depth = 1): void {
            if (depth > config.maxMusicSearchDepth) {
                return;
            } //workaround for circular symlinks
            const lstat = fs.statSync(musicPath);
            if (lstat.isDirectory()) {
                return fs
                    .readdirSync(musicPath)
                    .forEach(subPath => data.addMusic(path.join(musicPath, subPath), depth + 1));
            }
            const song = {
                filename: path.basename(musicPath),
                path: musicPath,
                uuid: Symbol(musicPath),
                tags: undefined as any,
            };
            readTags(song.path).then(tags => {
                song.tags = tags;
                data.musicUpdated++;
                data.update();
            });

            data.music.push(song);
            data.musicUpdated++;
            data.update();
        },
        update() {
            musiclist.update();
            nowplaying.update();
            lyricview.update();
            if (data.filter !== prevData.filter) {
                prevData.filter = data.filter;
            }
            const song = data.nowPlaying;
            const artsrc = song && song.tags ? song.tags.art || "" : "";
            if (fsimg.src !== artsrc) fsimg.src = artsrc;
        },
    };
    const prevData = {
        filter: "",
    };

    const musiclist = listMusicElem(songlistcol, data);
    const nowplaying = nowPlayingElem(nowPlayingBar, data);
    const lyricview = lyricViewElem(songlyricscol, data);

    data.update();

    songlistsearch.onev("input", () => {
        data.filter = songlistsearch.value;
        data.update();
    });

    return data;
}

type Data = {
    play: boolean;
    filter: string;
    music: MusicData[];
    musicUpdated: number;
    nowPlaying: MusicData | undefined;
    nowPlayingUpdated: number;

    queueImmediate(song: MusicData): void;
    queueFinal(song: MusicData): void;
    playNext(): void;
    addMusic(musicPath: string, depth?: number): void;
    update(): void;
    addQueue(diff: number): void;
};

function lyricViewElem(parent: HTMLElement, data: Data) {
    const defer = makeDefer();
    const nowPlayingLyrics = el("div")
        .clss("nowplaying_lyrics")
        .adto(parent)
        .drmv(defer);

    const editButton = el("button")
        .clss("lyricsedtr-button")
        .atxt("…")
        .adto(nowPlayingLyrics);
    const lyricContainer = txt("…").adto(
        el("p")
            .clss("lyrics")
            .adto(nowPlayingLyrics),
    );

    const prevData = {
        lyrics: undefined as any,
        allowEdit: undefined as any,
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
            data.update();
        });
    });

    const res = {
        update() {
            const thisLyrics = data.nowPlaying
                ? data.nowPlaying.tags
                    ? data.nowPlaying.tags.album || "undefined"
                    : "…"
                : "Not playing";
            if (thisLyrics !== prevData.lyrics) {
                prevData.lyrics = thisLyrics;
                lyricContainer.nodeValue = thisLyrics;
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
                } else {
                    editButton.textContent = "…";
                }
            }
        },
    };
    return res;
}

function listMusicElem(parent: HTMLElement, data: Data) {
    const prevData = {
        filter: undefined as any,
        musicUpdated: undefined as any,
        currentlyPlaying: undefined as any,
    };

    const defer = makeDefer();
    let songlistul = el("ul")
        .adto(parent)
        .clss("songlist");

    const res = {
        remove() {
            defer.cleanup();
            songlistul.remove();
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

            if (new Date().getTime() - config.updateSpeedLimit < lastList) {
                llTimeout && clearTimeout(llTimeout);
                llTimeout = setTimeout(() => res.update(), config.updateSpeedLimit);
                return;
            }
            let loadCount = 0;
            const newList = el("ul").clss("songlist");
            for (const song of data.music) {
                if (!playlistFilter(song, data.filter)) {
                    continue;
                }
                const playing = data.nowPlaying === song;
                const li = el("li")
                    .attr({
                        role: "button",
                        "aria-pressed": "" + playing,
                        tabindex: "0",
                    })
                    .clss(playing ? "playing" : "")
                    .onev("click", e => {
                        e.stopPropagation();
                        data.queueImmediate(song);
                    })
                    .adto(newList);
                if (!song.tags) {
                    loadCount++;
                    createLoadingSpinner().adto(li);
                }
                if (song.tags && song.tags.art)
                    el("img")
                        .attr({ src: song.tags.art })
                        .clss("icon")
                        .adto(li);
                el("span")
                    .atxt(
                        song.tags && song.tags.title && song.tags.artist
                            ? " " + song.tags.artist + " - " + song.tags.title
                            : " " + song.filename,
                    )
                    .adto(li);
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
                        data.queueFinal(song);
                        spawnParticle(e.clientX, e.clientY, "+");
                    });
                if (song.tags && song.tags.color)
                    li.styl({
                        "--track-foreground": song.tags.color.dark.hex(),
                        "--track-background": song.tags.color.light.hex(),
                    });
            }
            if (loadCount > 0)
                el("li")
                    .adch(createLoadingSpinner())
                    .atxt("Loading " + loadCount + " more songs...");
            songlistul.remove();
            songlistul = newList.adto(parent);
            lastList = new Date().getTime();
        },
    };
    return res;
}

const musicPlayer = MusicPlayer(body);

const savedregex = { regex: new RegExp(""), text: "" };

const playlistFilter = (song: MusicData, filterStr: string) => {
    let searchdata = song.filename;
    if (song.tags) {
        searchdata += ` ${"" + song.tags.title} ${"" + song.tags.artist} ${"" + song.tags.album}`;
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
        return savedregex.regex.exec(searchValue) != null;
    }

    searchdata = searchdata.toLowerCase();

    const searchTerm = searchValue.toLowerCase();
    return searchTerm
        .split(" ")
        .every(i => (searchdata.includes(i) ? ((searchdata = searchdata.replace(i, "")), true) : false));
};

function createLoadingSpinner() {
    return el("span").atxt("...");
}

async function getDarkLight(imgbuffer: Buffer): Promise<ColorProperty> {
    const vibrant = Vibrant.from(imgbuffer);
    const swatches = await vibrant.getSwatches();

    let dark = Color(swatches.DarkVibrant.hex);
    let light = Color(swatches.LightVibrant.hex);

    let contrastRatio = dark.contrast(light);

    while (contrastRatio < config.minContrast) {
        dark = dark.darken(config.constrastStepChange);
        light = light.lighten(config.constrastStepChange);
        contrastRatio = dark.contrast(light);
    }

    return { dark, light };
}
class Mutex {
    private mutex = Promise.resolve();

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
    const songTags = (await mm.parseFile(filename, {})).common as SongTags;
    unlock();
    if (songTags.picture && songTags.picture[0]) {
        songTags.art = `data:${songTags.picture[0].format};base64,${songTags.picture[0].data.toString("base64")}`;
        const artBuffer = songTags.picture[0].data;

        songTags.color = await getDarkLight(artBuffer);
    } else {
        songTags.art = `img/no_art.png`;
        songTags.color = { dark: Color("#a00"), light: Color("#fff") };
    }
    return songTags;
}

// load music

musicPlayer.addMusic(path.join(os.homedir(), "Music"));
musicPlayer.playNext();

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

    const nowPlayingVlist = el("div")
        .clss("verticallist")
        .adto(nowPlayingBar)
        .drmv(defer);
    const nowPlayingTitle = txt("...").adto(
        el("div")
            .clss(".vlitem.nowplaying_title")
            .adto(nowPlayingVlist),
    );
    const nowPlayingArtist = txt("...").adto(
        el("div")
            .clss(".vlitem.nowplaying_artist")
            .adto(nowPlayingVlist),
    );
    const nowPlayingFilename = txt("...").adto(
        el("div")
            .clss(".vlitem.nowplaying_filename")
            .adto(nowPlayingVlist),
    );
    const elAudio = el("audio")
        .adto(nowPlayingBar)
        .drmv(defer);

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
        const artsrc = song && song.tags ? song.tags.art || "" : "";
        if (artEl.src !== artsrc) artEl.src = artsrc;

        if (song && song.tags && song.tags.color) {
            document.documentElement.style.setProperty("--foreground", song.tags.color.light.hex());
            document.documentElement.style.setProperty("--background", song.tags.color.dark.hex());
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
                elAudio.src = encodeURI(data.nowPlaying ? data.nowPlaying.path || "" : "").replace(/\?/g, "%3F");
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
                    elAudio.play();
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
        data.play = !data.play;
        data.update();
    });

    elAudio.onev("ended", () => {
        data.play = true;
        data.addQueue(1);
    });

    btnNext.addEventListener("click", (e /*: MouseEvent*/) => {
        e.stopPropagation();
        data.play = true;
        data.addQueue(1);
    });

    btnPrev.addEventListener("click", (e /*: MouseEvent*/) => {
        e.stopPropagation();
        data.play = true;
        data.addQueue(-1);
    });

    return res;
}

function randomOfArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function showLyricsEditor(song: MusicData, songtags: SongTags, onclose: () => void) {
    const defer = makeDefer();
    defer(() => onclose());

    const win = el("div")
        .adto(body)
        .clss(".lyricsedtr")
        .drmv(defer);

    win.setAttribute("style", document.documentElement.getAttribute("style") || "");

    const fylnmehdng = el("h1").adto(win);

    const albumArt = el("img")
        .adto(win)
        .clss("lyricsedtr-img")
        .attr({ src: songtags.art })
        .adto(fylnmehdng);
    fylnmehdng.atxt(song.filename);

    const setEnabled = (v: boolean) => {
        btncancel.disabled = !v;
        btnsave.disabled = !v;
        txtarya.disabled = !v;
        titlenput.disabled = !v;
        artistnput.disabled = !v;
    };

    const btnsave = el("button")
        .adto(win)
        .atxt("Save")
        .clss("lyricsedtr-button")
        .onev("click", () => {
            setEnabled(false);
            btncancel.disabled = true;
            btnsave.disabled = true;
            btnsave.textContent = "Saving...";

            let atchmntnme = "";
            if (imgset) {
                atchmntnme = "/tmp/" + imgset.egname;
                fs.writeFileSync(atchmntnme, imgset.buffer);
            } else if (songtags.picture && songtags.picture[0]) {
                const fmtval = songtags.picture[0].format;
                atchmntnme = "/tmp/" + "__CONTINUE." + fmtval.substr(fmtval.lastIndexOf("/") + 1);
                fs.writeFileSync(atchmntnme, songtags.picture[0].data);
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
                            song.tags.album = txtarya.value;
                            song.tags.title = titlenput.value;
                            song.tags.artist = artistnput.value;
                            if (imgset) {
                                song.tags.art = imgset.url;
                                song.tags.color = imgset.colors;
                                song.tags.picture = undefined;
                            }
                        }
                        defer.cleanup();
                    }
                },
            );
        });

    const btncancel = el("button")
        .adto(win)
        .atxt("Cancel")
        .clss("lyricsedtr-button.lyricsedtr-button-cancel")
        .onev("click", () => {
            defer.cleanup();
        });

    el("h2")
        .adto(win)
        .atxt("Title");

    const [defaultArtist, defaultTitle] = song.filename.replace(".mp3", "").split(" - ");

    const titlenput = el("input")
        .adto(el("div").adto(win))
        .attr({ placeholder: "Title..." })
        .clss("lyricsedtr-input")
        .dwth(v => (v.value = songtags.title || defaultTitle));

    el("h2")
        .adto(win)
        .atxt("Author");

    const artistnput = el("input")
        .adto(el("div").adto(win))
        .attr({ placeholder: "Author..." })
        .clss("lyricsedtr-input")
        .dwth(v => (v.value = songtags.artist || defaultArtist));

    el("h2")
        .adto(win)
        .atxt("Lyrics ");

    let imgset: { url: string; buffer: Buffer; egname: string; colors: ColorProperty } | undefined;

    function setImage(newimg: Buffer, format: string) {
        getDarkLight(newimg)
            .then(res => {
                const srcval = "data:image/" + format + ";base64," + newimg.toString("base64");
                albumArt.src = srcval;
                win.style.setProperty("--background", res.dark.hex());
                win.style.setProperty("--foreground", res.light.hex());
                imgset = {
                    url: srcval,
                    buffer: newimg,
                    egname: "__TEMPIMAGE." + format,
                    colors: res,
                };
            })
            .catch(e => alert(e.stack));
    }

    const lyricsearcharea = el("div").adto(win);
    const lspanel: LyricSearchPanel = lyricSearchPanel(
        lyricsearcharea,
        artistnput.value.split(" · ")[0] + " - " + titlenput.value.split(" · ")[0],
        updnfo => {
            txtarya.value = updnfo.lyrics;
            if (updnfo.image) setImage(updnfo.image.buffer, updnfo.image.format);
            console.log(updnfo);
            txtaryaupd8();
        },
    );
    defer(() => lspanel.close());

    const txtarya = el("textarea")
        .adto(el("div").adto(win))
        .attr({ placeholder: "Lyrics..." })
        .clss("lyricsedtr-input")
        .dwth(v => (v.value = "" + songtags.album));

    const txtaryaupd8 = anychange([txtarya], () => {
        txtarya.rows = txtarya.value.split("\n").length + 1;
    });
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
    const resultsArea = el("li")
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
