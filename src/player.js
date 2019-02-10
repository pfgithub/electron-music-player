/* eslint-env node, browser */
/* global Promise Proxy */

let config = {
	minContrast: 3.0,
	constrastStepChange: 0.25, // How quickly to change background and foreground colors when fixing contrast,
	lightMode: false,
	updateSpeedLimit: 100 // Minimum ms allowed between each update of the music list. Higher means songs update in larger groups. 
};

const fs = require("fs");
const os = require("os");
const url = require("url");
const path = require("path");
const Color = require("color");
const uuid = require("uuid/v4");
const mm = require("music-metadata");
const Vibrant = require("node-vibrant");

let elAudio = document.getElementById("nowplaying_audio");
let elSkip = document.getElementById("skip");
let elPrevious = document.getElementById("previous");
let elSonglist = document.getElementById("songlist");
let elSearch = document.getElementById("search");

document.getElementById("playpause").addEventListener("click", playpause);

function playpause() {
	if(elAudio.paused) {elAudio.play();} else {elAudio.pause();}
}

let currentlyPlaying;

let music = fs.readdirSync(path.join(os.homedir(), "Music"))
	.map(song => 
		({
			path: path.join(os.homedir(), "Music", song),
			filename: song
		})
	);
	

let playlistFilter = song => {
	let searchdata = song.filename;
	if(song.tags) {
		searchdata += ` ${song.tags.title} ${song.tags.author} ${song.tags.album}`;
	}
	searchdata = searchdata.toLowerCase();
	return searchdata.indexOf(elSearch.value.toLowerCase()) > -1;
};

let lastList = 0;
let llTimeout;

function listMusic() {
	if((new Date).getTime() - config.updateSpeedLimit < lastList) {
		llTimeout && clearTimeout(llTimeout);
		llTimeout = setTimeout(listMusic, config.updateSpeedLimit);
		return;
	}
	let newList = document.createElement("ul");
	newList.setAttribute("id", "songlist");
	music.forEach(song => {
		if(!playlistFilter(song)) {return;}
		let li = document.createElement("li");
		if(song.tags && song.tags.art) {
			let icon = document.createElement("img");
			icon.src = song.tags.art;
			icon.classList.add("icon");
			li.appendChild(icon);
		}
		let title  = document.createElement("a");
		title.href = "#";
		title.addEventListener("click", e => {
			e.preventDefault();
			playSong(song);
		});
		if(song.tags && song.tags.title && song.tags.artist) {
			title.innerText = (`${song.tags.title} by ${song.tags.artist}`);
		}else{
			title.innerText = (`${song.filename}`);
		}
		li.appendChild(title);
		if(currentlyPlaying === song.path) {
			li.classList.add("playing");
		}
		if(song.tags && song.tags.color) {
			if(config.lightMode) {
				li.style.setProperty("--track-foreground", song.tags.color.dark.hex());
				li.style.setProperty("--track-background", song.tags.color.light.hex());
			}else{
				li.style.setProperty("--track-foreground", song.tags.color.light.hex());
				li.style.setProperty("--track-background", song.tags.color.dark.hex());
			}
		}
		newList.appendChild(li);
	});
	elSonglist.parentNode.replaceChild(newList, elSonglist);
	elSonglist = newList;
	lastList = (new Date).getTime();
}
elSearch.addEventListener("input", listMusic);

function startLoadingMusic() {
	listMusic();
	loadMusic();
}

async function loadMusic() {
	for(let song of music) {
		song.tags = await readTags(song.path);
		// update in song list
		listMusic();
	}
}

async function readTags(filename) {
	let songTags = (await mm.parseFile(filename, {})).common;
	if(songTags.picture && songTags.picture[0]) {
		songTags.art = `data:${songTags.picture[0].format};base64,${songTags.picture[0].data.toString("base64")}`;
		songTags.artBuffer = songTags.picture[0].data;
		songTags.vibrant = Vibrant.from(songTags.artBuffer);
		songTags.swatches = await songTags.vibrant.getSwatches();
		
		let dark = Color(songTags.swatches.DarkVibrant.hex);
		let light = Color(songTags.swatches.LightVibrant.hex);
		
		let contrastRatio = dark.contrast(light);
		
		while(contrastRatio < config.minContrast) {
			dark = dark.darken(config.constrastStepChange);
			light = light.lighten(config.constrastStepChange);
			contrastRatio = dark.contrast(light);
		}
		
		songTags.color = {dark, light};
	}else{
		songTags.art = `resources/no_art.png`;
		songTags.color = {dark: Color("#f00"), light: Color("#fff")};
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
	currentlyPlaying = song.path;
	listMusic();
	
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
	if(!songTags.color) {return;}
	
	if(config.lightMode) {
		document.documentElement.style.setProperty("--foreground", songTags.color.dark.hex());
		document.documentElement.style.setProperty("--background", songTags.color.light.hex());
		document.documentElement.style.setProperty("--background2", "#fff");
	}else{
		document.documentElement.style.setProperty("--foreground", songTags.color.light.hex());
		document.documentElement.style.setProperty("--background", songTags.color.dark.hex());
		document.documentElement.style.setProperty("--background2", "#000");
	}
}