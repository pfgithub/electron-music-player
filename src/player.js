/* eslint-env node, browser */
/* global Promise Proxy */

let config = {
	minContrast: 3.0,
	constrastStepChange: 0.25, // How quickly to change background and foreground colors when fixing contrast,
	lightMode: false
};

const fs = require("fs");
const os = require("os");
const url = require("url");
const path = require("path");
const Color = require("color");
const mm = require("music-metadata");
const Vibrant = require("node-vibrant");

let elAudio = document.getElementById("nowplaying_audio");
let elSkip = document.getElementById("skip");
let elPrevious = document.getElementById("previous");
let elSonglist = document.getElementById("songlist");

require("electron").ipcRenderer.on("playpause", (event, message) => {
	playpause();
});
document.getElementById("playpause").addEventListener("click", playpause);

function playpause() {
	if(elAudio.paused) {elAudio.play();} else {elAudio.pause();}
}

let music = fs.readdirSync(path.join(os.homedir(), "Music"))
	.map(song => 
		({
			path: path.join(os.homedir(), "Music", song),
			filename: song
		})
	);

function startLoadingMusic() {
	music.forEach(song => {
		// add to song list
	});
	loadMusic();
}

async function loadMusic() {
	for(let song of music) {
		song.tags = await readTags(song.path);
		// update in song list
	}
}

async function readTags(filename) {
	let songTags = (await mm.parseFile(filename, {})).common;
	if(songTags.picture && songTags.picture[0]) {
		songTags.art = `data:${songTags.picture[0].format};base64,${songTags.picture[0].data.toString("base64")}`;
		songTags.artBuffer = songTags.picture[0].data;
	}else{
		songTags.art = `resources/no_art.png`;
	}
	return songTags;
}

// load music
startLoadingMusic();
playRandom();

elAudio.addEventListener("ended", () => {
	playRandom();
});

elSkip.addEventListener("click", () => {
	playRandom();
});

elPrevious.addEventListener("click", () => {
	playRandom();
});

function playRandom() {
	let randomMusic = music[Math.floor(Math.random()*music.length)];
	playSong(randomMusic);
}

async function playSong(song) {
	elAudio.src = song.path;
	elAudio.play();
	
	let elArt = document.getElementById("nowplaying_art");
	let elTitle = document.getElementById("nowplaying_title");
	let elArtist = document.getElementById("nowplaying_artist");
	let elLyrics = document.getElementById("nowplaying_lyrics");
	let elFilename = document.getElementById("nowplaying_filename");
	let elNowPlaying = document.getElementById("nowplaying");
	
	elFilename.innerText = song.filename;
	
	let songTags = song.tags || await readTags(song.path);
	
	console.log(songTags);
	
	elArt.src = songTags.art;
	elTitle.innerText = songTags.title;
	elArtist.innerText = songTags.artist;
	elLyrics.innerText = songTags.album;
	
	// let vibrant = Vibrant.from(elArt); // not available in node
	let vibrant = Vibrant.from(songTags.artBuffer);
	let swatches = await vibrant.getSwatches();
	
	let dark = Color(swatches.DarkVibrant.hex);
	let light = Color(swatches.LightVibrant.hex);
	
	let contrastRatio = dark.contrast(light);
	
	while(contrastRatio < config.minContrast) {
		dark = dark.darken(config.constrastStepChange);
		light = light.lighten(config.constrastStepChange);
		contrastRatio = dark.contrast(light);
	}
	
	if(config.lightMode) {
		document.documentElement.style.setProperty("--foreground", dark.hex());
		document.documentElement.style.setProperty("--background", light.hex());
		document.documentElement.style.setProperty("--background2", "#fff");
	}else{
		document.documentElement.style.setProperty("--foreground", light.hex());
		document.documentElement.style.setProperty("--background", dark.hex());
		document.documentElement.style.setProperty("--background2", "#000");
	}
}