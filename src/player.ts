import { $scss, el as qdel } from "./qdom";
import { App, hack } from "./App";
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
import Color from "color";
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
    const secret: { accessToken: string } = JSON.parse(
        fs.readFileSync("src/secret.json", "utf-8"),
    );
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
    write: (
        path: string,
        m1: FFMetadataMetadata,
        options: FFMetadataOptions,
        cb: (e?: Error) => void,
    ) => void;
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
#nowplaying_title {
	font-weight: bold;
}
#nowplaying_artist {
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

#nowplaying_art {
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
#nowplaying_lyrics {
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
#playpause.play > .btnpause {
	display: block;
}
#playpause:not(.play) > .btnplay {
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
`;

function spawnParticle(x: number, y: number, text: string) {
    const particle = qdel.div({ class: "particle" });
    particle.appendChild(document.createTextNode(text));
    particle.style.setProperty("--x", x + "px");
    particle.style.setProperty("--y", y + "px");
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

declare let main: App;

const elAudio = main.nowPlayingAudio;
const elSkip = main.nowPlayingBtnSkipForwardElem;
const elPrevious = main.nowPlayingBtnPreviousElem;
let elSonglist = main.songListElem;
const elSearch = main.songListSearchField;
const elPlaypause = main.nowPlayingBtnPlaypauseElem;

if (
    !elAudio ||
    !elSkip ||
    !elPrevious ||
    !elSonglist ||
    !elSearch ||
    !elPlaypause
) {
    alert("An element was missing during initialization.");
    throw new Error("An element was missing during initialization.");
}

if (!(elAudio instanceof HTMLAudioElement)) {
    alert("Audio element was incorrect during initialization.");
    throw new Error(
        "Audio element element was incorrect during initialization.",
    );
}

type ColorProperty = {
    dark: { hex: () => string };
    light: { hex: () => string };
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

const queue: (MusicData | undefined)[] = [];
let queueIndex = 0;

elPlaypause.addEventListener("click", (e /*: MouseEvent*/) => {
    e.stopPropagation();
    playpause();
});

function playpause(value?: boolean): void {
    if (value === undefined) {
        return playpause(elAudio.paused);
    }
    if (value) {
        elAudio.play();
        elPlaypause.classList.add("play");
    } else {
        elAudio.pause();
        elPlaypause.classList.remove("play");
    }
}

let currentlyPlaying: string;
const music: MusicData[] = [];

function addMusic(musicPath: string, depth = 1): void {
    if (depth > config.maxMusicSearchDepth) {
        return;
    } //workaround for circular symlinks
    const lstat = fs.statSync(musicPath);
    console.log(lstat.isDirectory());
    if (lstat.isDirectory()) {
        return fs
            .readdirSync(musicPath)
            .forEach(subPath =>
                addMusic(path.join(musicPath, subPath), depth + 1),
            );
    }
    const song = {
        filename: path.basename(musicPath),
        path: musicPath,
        uuid: Symbol(musicPath),
        tags: undefined as any,
    };
    music.push(song);
}

const savedregex = { regex: new RegExp(""), text: "" };

const playlistFilter = (song: MusicData) => {
    let searchdata = song.filename;
    if (song.tags) {
        searchdata += ` ${"" + song.tags.title} ${"" + song.tags.artist} ${"" +
            song.tags.album}`;
    }

    const searchValue = elSearch.value;
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
        .every(i =>
            searchdata.includes(i)
                ? ((searchdata = searchdata.replace(i, "")), true)
                : false,
        );
};

let lastList = 0;
let llTimeout: NodeJS.Timeout;

function createLoadingSpinner() {
    return qdel.span("...");
}

function listMusic() {
    if (new Date().getTime() - config.updateSpeedLimit < lastList) {
        llTimeout && clearTimeout(llTimeout);
        llTimeout = setTimeout(listMusic, config.updateSpeedLimit);
        return;
    }
    let loadCount = 0;
    const newList = qdel.ul(
        { id: "songlist" },
        music.map(song => {
            if (!playlistFilter(song)) {
                return;
            }
            const playing = currentlyPlaying === song.path;
            const li = qdel.li(
                {
                    role: "button",
                    "aria-pressed": playing ? "true" : "false",
                    tabindex: "0",
                    class: playing ? "playing" : "",
                    $: {
                        click: (e: MouseEvent) => {
                            e.stopPropagation();
                            queueImmediate(song);
                        },
                    },
                },
                !song.tags && (loadCount++, createLoadingSpinner()),
                song.tags &&
                    song.tags.art &&
                    qdel.img({ src: song.tags.art, class: "icon" }),
                qdel.span(
                    {},
                    song.tags && song.tags.title && song.tags.artist
                        ? ` ${song.tags.artist} - ${song.tags.title}`
                        : ` ${song.filename}`,
                ),
                qdel.div(
                    { class: "itembuttons" },
                    qdel.button(
                        {
                            title: "queue",
                            $: {
                                click: (e: MouseEvent) => {
                                    e.stopPropagation();
                                    queueFinal(song);
                                    spawnParticle(e.clientX, e.clientY, "+");
                                },
                            },
                        },
                        "+",
                    ),
                ),
            );
            if (song.tags && song.tags.color) {
                if (config.lightMode) {
                    li.style.setProperty(
                        "--track-foreground",
                        song.tags.color.dark.hex(),
                    );
                    li.style.setProperty(
                        "--track-background",
                        song.tags.color.light.hex(),
                    );
                } else {
                    li.style.setProperty(
                        "--track-foreground",
                        song.tags.color.light.hex(),
                    );
                    li.style.setProperty(
                        "--track-background",
                        song.tags.color.dark.hex(),
                    );
                }
            }
            return li;
        }),
        loadCount > 0 &&
            qdel.li(
                {},
                createLoadingSpinner(),
                `Loading ${"" + loadCount} more songs...`,
            ),
    );
    elSonglist.parentNode &&
        elSonglist.parentNode.replaceChild(newList, elSonglist);
    elSonglist = newList;
    lastList = new Date().getTime();
}
elSearch.addEventListener("input", listMusic);

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

async function readTags(filename: string) {
    const songTags = (await mm.parseFile(filename, {})).common as SongTags;
    if (songTags.picture && songTags.picture[0]) {
        songTags.art = `data:${
            songTags.picture[0].format
        };base64,${songTags.picture[0].data.toString("base64")}`;
        const artBuffer = songTags.picture[0].data;

        songTags.color = await getDarkLight(artBuffer);
    } else {
        songTags.art = `img/no_art.png`;
        songTags.color = { dark: Color("#a00"), light: Color("#fff") };
    }
    return songTags;
}

async function loadMusic() {
    for (const song of music) {
        if (song.tags) {
            continue;
        }
        song.tags = await readTags(song.path);
        // update in song list
        listMusic();
    }
}

// load music

addMusic(path.join(os.homedir(), "Music"));
loadMusic();
playNext();

elAudio.addEventListener("ended", () => {
    playNext();
});

elSkip.addEventListener("click", (e /*: MouseEvent*/) => {
    e.stopPropagation();
    playNext();
});

elPrevious.addEventListener("click", (e /*: MouseEvent*/) => {
    e.stopPropagation();
    queueIndex--;
    updatePlay();
});

function playNext() {
    queueIndex++;
    updatePlay();
}

function queueImmediate(song: MusicData) {
    queueIndex = queue.length;
    queue.push(song);
    updatePlay();
}

function queueFinal(song: MusicData) {
    queue.push(song);
}

function fillRandom() {
    const randomMusic = music[Math.floor(Math.random() * music.length)];
    queue[queueIndex] = randomMusic;
}

async function updatePlay() {
    if (queue.length > 1000 && queueIndex > 1) {
        queue.shift();
        queueIndex--;
    }

    while (queueIndex < 0) {
        queue.unshift(undefined);
        queueIndex++;
    }

    let song = queue[queueIndex];
    if (!song) {
        fillRandom();
        song = queue[queueIndex];
        if (!song) {
            alert("no music :(");
            return;
        }
    }

    const songTags = song.tags || (await readTags(song.path));
    if (songTags && !song.tags) song.tags = songTags; // useful for editing

    currentlyPlaying = song.path;
    listMusic();

    elAudio.src = encodeURI(song.path).replace(/\?/g, "%3F");
    playpause(true);

    rerenderPlay();
}
function rerenderPlay() {
    const song = queue[queueIndex]!;
    const songTags = song.tags!;
    
    const elArt = main.nowPlayingArtElem;
    const elArtHack = main.nowPlayingArtHackElem;
    const elTitle = main.nowPlayingTitle;
    const elArtist = main.nowPlayingArtist;
    const elLyrics = main.nowPlayingLyrics;
    const elFilename = main.nowPlayingFilename;

    elFilename.innerText = song.filename;

    console.log(songTags);

    elArt.src = songTags.art;
    elArtHack.src = songTags.art;
    elTitle.innerText = "" + songTags.title;
    elArtist.innerText = "" + songTags.artist;

    function renderLyrics() {
        const lyricsHL = `${"" + songTags.album}`.split("");
        let lowercaseLyrics = lyricsHL.join("").toLowerCase();
        const charsHL = " ".repeat(lyricsHL.length).split("");

        const searchTerm = elSearch.value.toLowerCase();
        for (const word of searchTerm.split(" ")) {
            if (!word) continue;
            while (true) {
                const foundLoc = lowercaseLyrics.indexOf(word);
                console.log(foundLoc);
                if (foundLoc === -1) break;
                const length = word.length;
                for (let i = foundLoc; i < foundLoc + length; i++) {
                    charsHL[i] = "b";
                }
                lowercaseLyrics = lowercaseLyrics.replace(
                    word,
                    " ".repeat(word.length),
                );
            }
        }

        const lyricContainerO = document.createDocumentFragment();

        const editButton = el("button")
            .clss("lyricsedtr-button")
            .atxt("Edit")
            .adto(lyricContainerO);
        const lyricContainer = el("p").adto(lyricContainerO);

        let prevTag = "";
        let text = "";
        let commit = () => {};

        charsHL.forEach((tag, i) => {
            if (lyricsHL[i] === "\n") tag = "newline";
            if (tag !== prevTag || tag === "newline") {
                commit();
                text = "";
                prevTag = tag;
                if (tag === " ") {
                    commit = () => {
                        const tag = document.createTextNode(text);
                        lyricContainer.appendChild(tag);
                    };
                } else if (tag === "b") {
                    commit = () => {
                        const bold = document.createElement("b");
                        const tag = document.createTextNode(text);
                        bold.appendChild(tag);
                        lyricContainer.appendChild(bold);
                    };
                } else if (tag === "newline") {
                    commit = () => {
                        const br = document.createElement("br");
                        lyricContainer.appendChild(br);
                    };
                } else {
                    console.log("error");
                    commit = () => {};
                }
            }
            text += lyricsHL[i];
        });
        commit();

        editButton.addEventListener("click", () =>
            showLyricsEditor(song, songTags, () =>
                rerenderPlay(),
            ),
        );

        console.log(lyricContainer);

        elLyrics.innerHTML = "";
        elLyrics.appendChild(lyricContainerO);
    }

    renderLyrics();

    // let vibrant = Vibrant.from(elArt); // not available in node
    if (!songTags.color) {
        return;
    }

    if (config.lightMode) {
        document.documentElement.style.setProperty(
            "--foreground",
            songTags.color.dark.hex(),
        );
        document.documentElement.style.setProperty(
            "--background",
            songTags.color.light.hex(),
        );
        document.documentElement.style.setProperty("--background2", "#fff");
    } else {
        document.documentElement.style.setProperty(
            "--foreground",
            songTags.color.light.hex(),
        );
        document.documentElement.style.setProperty(
            "--background",
            songTags.color.dark.hex(),
        );
        document.documentElement.style.setProperty("--background2", "#000");
    }
}

function showLyricsEditor(
    song: MusicData,
    songtags: SongTags,
    onclose: () => void,
) {
    const defer = makeDefer();
    defer(() => onclose());

    const win = el("div")
        .adto(body)
        .clss(".lyricsedtr")
        .drmv(defer);

    win.setAttribute(
        "style",
        document.documentElement.getAttribute("style") || "",
    );

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

            if (imgset) {
                fs.writeFileSync("/tmp/" + imgset.egname, imgset.buffer);
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
                imgset ? { attachments: ["/tmp/" + imgset.egname] } : {},
                err => {
                    if (err) {
                        btnsave.textContent = "Save";
                        setEnabled(true);
                        console.log(err);
                        alert("" + err);
                    } else {
                        if (song.tags) {
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

    const [defaultArtist, defaultTitle] = song.filename
        .replace(".mp3", "")
        .split(" - ");

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

    let imgset:
        | { url: string; buffer: Buffer; egname: string; colors: ColorProperty }
        | undefined;

    function setImage(newimg: Buffer, format: string) {
        getDarkLight(newimg)
            .then(res => {
                const srcval =
                    "data:image/" +
                    format +
                    ";base64," +
                    newimg.toString("base64");
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
        artistnput.value.split(" · ")[0] +
            " - " +
            titlenput.value.split(" · ")[0],
        updnfo => {
            txtarya.value = updnfo.lyrics;
            if (updnfo.image)
                setImage(updnfo.image.buffer, updnfo.image.format);
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
                            return await (
                                await fetch(result.song_art_image_url)
                            ).buffer();
                        })().catch(() => undefined),
                    ]);

                    update({
                        lyrics,
                        image: image
                            ? {
                                  buffer: image,
                                  format: result.song_art_image_url.substr(
                                      result.song_art_image_url.lastIndexOf(
                                          ".",
                                      ) + 1,
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
                lyricsClients!.genius.search(
                    searchTerm.value,
                    (e: any, v: any) => (e ? re(e) : r(v)),
                ),
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
    Array.from(e.dataTransfer.files).forEach(f => addMusic((f as any).path));
    loadMusic();

    return false;
};
