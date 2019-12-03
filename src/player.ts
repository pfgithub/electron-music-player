import { $scss, el } from './qdom'
import {} from './App'

let config = {
	minContrast: 5.0,
	constrastStepChange: 0.25, // How quickly to change background and foreground colors when fixing contrast,
	lightMode: false,
	updateSpeedLimit: 100, // Minimum ms allowed between each update of the music list. Higher means songs update in larger groups.
	maxMusicSearchDepth: 10, // Max search depth of folders in music added
}

import * as fs from 'fs' // .promises
import * as os from 'os'
import * as url from 'url'
import * as path from 'path'
import Color from 'color'
import * as mm from 'music-metadata'
import * as Vibrant from 'node-vibrant'

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
	display: flex;
	flex-flow: wrap;
}

@media screen and (max-width: 600px) {
	.columns {
		flex-direction: vertical;
	}

	.column {
		flex-grow: 1;
		flex-basis: 0;
	}
}

.column {
	flex-grow: 1;
	flex-basis: 0;
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
	background-color: var(--background2);
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
	cursor: pointer;
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
`

let elAudio = main.nowPlayingAudio
let elSkip = main.nowPlayingBtnSkipForwardElem
let elPrevious = main.nowPlayingBtnPreviousElem
let elSonglist = main.songListElem
let elSearch = main.songListSearchField
let elPlaypause = main.nowPlayingBtnPlaypauseElem

if (
	!elAudio ||
	!elSkip ||
	!elPrevious ||
	!elSonglist ||
	!elSearch ||
	!elPlaypause
) {
	alert('An element was missing during initialization.')
	throw new Error('An element was missing during initialization.')
}

if (!(elAudio instanceof HTMLAudioElement)) {
	alert('Audio element was incorrect during initialization.')
	throw new Error(
		'Audio element element was incorrect during initialization.',
	)
}

type MusicData = { filename: string; path: string; uuid: Symbol; tags: any }

let history: MusicData[] = []

elPlaypause.addEventListener('click', (e /*: MouseEvent*/) => {
	e.preventDefault()
	playpause()
})

function playpause(value?: boolean): void {
	if (value === undefined) {
		return playpause(elAudio.paused)
	}
	if (value) {
		elAudio.play()
		elPlaypause.classList.add('play')
	} else {
		elAudio.pause()
		elPlaypause.classList.remove('play')
	}
}

let currentlyPlaying: string
let music: MusicData[] = []

function addMusic(musicPath: string, depth = 1): void {
	if (depth > config.maxMusicSearchDepth) {
		return
	} //workaround for circular symlinks
	let lstat = fs.statSync(musicPath)
	console.log(lstat.isDirectory())
	if (lstat.isDirectory()) {
		return fs
			.readdirSync(musicPath)
			.forEach(subPath =>
				addMusic(path.join(musicPath, subPath), depth + 1),
			)
	}
	let song = {
		filename: path.basename(musicPath),
		path: musicPath,
		uuid: Symbol(musicPath),
		tags: undefined,
	}
	music.push(song)
}

let playlistFilter = (song: MusicData) => {
	let searchdata = song.filename
	if (song.tags) {
		searchdata += ` ${song.tags.title} ${song.tags.author} ${song.tags.album}`
	}
	searchdata = searchdata.toLowerCase()

	let searchTerm = elSearch.value.toLowerCase()
	return searchTerm
		.split(' ')
		.every(i =>
			searchdata.indexOf(i) > -1
				? (searchdata = searchdata.replace(i, ''), true)
				: false,
		)
}

let lastList = 0
let llTimeout: NodeJS.Timeout

function createLoadingSpinner() {
	return el.span('...')
}

function listMusic() {
	if (new Date().getTime() - config.updateSpeedLimit < lastList) {
		llTimeout && clearTimeout(llTimeout)
		llTimeout = setTimeout(listMusic, config.updateSpeedLimit)
		return
	}
	let loadCount = 0
	let newList = el.ul(
		{ id: 'songlist' },
		music.map(song => {
			if (!playlistFilter(song)) {
				return
			}
			let playing = currentlyPlaying === song.path
			let li = el.li(
				{
					role: 'button',
					'aria-pressed': playing ? 'true' : 'false',
					tabindex: '0',
					class: playing ? 'playing' : '',
					$: {
						click: e => {
							e.preventDefault, playSong(song)
						},
					},
				},
				!song.tags && (loadCount++, createLoadingSpinner()),
				song.tags &&
					song.tags.art &&
					el.img({ src: song.tags.art, class: 'icon' }),
				el.span(
					{},
					song.tags && song.tags.title && song.tags.artist
						? `${song.tags.title} by ${song.tags.artist}`
						: `${song.filename}`,
				),
			)
			if (song.tags && song.tags.color) {
				if (config.lightMode) {
					li.style.setProperty(
						'--track-foreground',
						song.tags.color.dark.hex(),
					)
					li.style.setProperty(
						'--track-background',
						song.tags.color.light.hex(),
					)
				} else {
					li.style.setProperty(
						'--track-foreground',
						song.tags.color.light.hex(),
					)
					li.style.setProperty(
						'--track-background',
						song.tags.color.dark.hex(),
					)
				}
			}
			return li
		}),
		loadCount > 0 &&
			el.li(
				{},
				createLoadingSpinner(),
				`Loading ${loadCount} more songs...`,
			),
	)
	elSonglist.parentNode &&
		elSonglist.parentNode.replaceChild(newList, elSonglist)
	elSonglist = newList
	lastList = new Date().getTime()
}
elSearch.addEventListener('input', listMusic)

async function readTags(filename: string) {
	let songTags = (await mm.parseFile(filename, {})).common
	if (songTags.picture && songTags.picture[0]) {
		songTags.art = `data:${
			songTags.picture[0].format
		};base64,${songTags.picture[0].data.toString('base64')}`
		songTags.artBuffer = songTags.picture[0].data
		songTags.vibrant = Vibrant.from(songTags.artBuffer)
		songTags.swatches = await songTags.vibrant.getSwatches()

		let dark = Color(songTags.swatches.DarkVibrant.hex)
		let light = Color(songTags.swatches.LightVibrant.hex)

		let contrastRatio = dark.contrast(light)

		while (contrastRatio < config.minContrast) {
			dark = dark.darken(config.constrastStepChange)
			light = light.lighten(config.constrastStepChange)
			contrastRatio = dark.contrast(light)
		}

		songTags.color = { dark, light }
	} else {
		songTags.art = `img/no_art.png`
		songTags.color = { dark: Color('#f00'), light: Color('#fff') }
	}
	return songTags
}

async function loadMusic() {
	for (let song of music) {
		if (song.tags) {
			continue
		}
		song.tags = await readTags(song.path)
		// update in song list
		listMusic()
	}
}

// load music

addMusic(path.join(os.homedir(), 'Music'))
loadMusic()
playRandom()

elAudio.addEventListener('ended', () => {
	playRandom()
})

elSkip.addEventListener('click', (e /*: MouseEvent*/) => {
	e.preventDefault()
	playRandom()
})

elPrevious.addEventListener('click', (e /*: MouseEvent*/) => {
	e.preventDefault()
	history.pop()
	let song = history.pop()
	if (song) {
		playSong(song)
	} else {
		playRandom()
	}
})

function playRandom() {
	let randomMusic = music[Math.floor(Math.random() * music.length)]
	if (!randomMusic) {
		return
	}
	playSong(randomMusic)
}

async function playSong(song: MusicData) {
	history.push(song)
	if (history.length > 1000) {
		history.shift()
	}

	currentlyPlaying = song.path
	listMusic()

	elAudio.src = song.path
	playpause(true)

	let elArt = main.nowPlayingArtElem
	let elTitle = main.nowPlayingTitle
	let elArtist = main.nowPlayingArtist
	let elLyrics = main.nowPlayingLyrics
	let elFilename = main.nowPlayingFilename

	elFilename.innerText = song.filename

	let songTags = song.tags || (await readTags(song.path))

	console.log(songTags)

	elArt.src = songTags.art
	elTitle.innerText = songTags.title
	elArtist.innerText = songTags.artist
	elLyrics.innerText = songTags.album

	// let vibrant = Vibrant.from(elArt); // not available in node
	if (!songTags.color) {
		return
	}

	if (config.lightMode) {
		document.documentElement.style.setProperty(
			'--foreground',
			songTags.color.dark.hex(),
		)
		document.documentElement.style.setProperty(
			'--background',
			songTags.color.light.hex(),
		)
		document.documentElement.style.setProperty('--background2', '#fff')
	} else {
		document.documentElement.style.setProperty(
			'--foreground',
			songTags.color.light.hex(),
		)
		document.documentElement.style.setProperty(
			'--background',
			songTags.color.dark.hex(),
		)
		document.documentElement.style.setProperty('--background2', '#000')
	}
}

let holder = document

holder.ondragover = () => {
	return false
}

holder.ondragleave = () => {
	return false
}

holder.ondragend = () => {
	return false
}

holder.ondrop = e => {
	e.preventDefault()

	if (!e.dataTransfer) {
		console.log('No datatransfer')
		alert('no datatransfer')
		return
	}
	console.log('Adding', e.dataTransfer.files.length, 'files.')
	Array.from(e.dataTransfer.files).forEach(f => addMusic(f.path))
	loadMusic()

	return false
}
