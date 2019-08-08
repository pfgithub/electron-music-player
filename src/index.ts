import { el } from './qdom'

function $scss(data: TemplateStringsArray) {
	const styleValue = data[0]
	const styleElem = document.createElement('style')
	styleElem.appendChild(document.createTextNode(styleValue))
	document.head.appendChild(styleElem)
}

$scss`
`

// reminder: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function svgButton(className: string, path: string) {
	let svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svgElem.classList.add('menubtn')
	svgElem.classList.add(className)
	svgElem.setAttributeNS(null, 'version', '1.1')
	svgElem.setAttributeNS(null, 'viewBox', '0 0 36 36')
	svgElem.setAttributeNS(null, 'width', '100%')
	svgElem.setAttributeNS(null, 'height', '100%')

	let pathElem = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path',
	)
	pathElem.classList.add('menupath')
	pathElem.setAttributeNS(null, 'd', path)
	svgElem.appendChild(pathElem)

	return svgElem
}

export let nowPlayingArtElem: HTMLImageElement
export let nowPlayingBtnPreviousElem: HTMLButtonElement
export let nowPlayingBtnPlaypauseElem: HTMLButtonElement
export let nowPlayingBtnSkipForwardElem: HTMLButtonElement
export let nowPlayingVList: HTMLDivElement
export let nowPlayingTitle: HTMLDivElement
export let nowPlayingArtist: HTMLDivElement
export let nowPlayingFilename: HTMLDivElement
export let nowPlayingAudio: HTMLAudioElement

export const nowPlayingElem = el.div(
	{ class: 'nowplaying', id: 'nowplaying' },
	nowPlayingArtElem = el.img({ src: '...', id: 'nowplaying_art' }),
	nowPlayingBtnPreviousElem = el.button(
		{ id: 'previous' },
		svgButton(
			'skipback',
			'M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z',
		),
	),
	nowPlayingBtnPlaypauseElem = el.button(
		{ id: 'playpause' },
		svgButton(
			'btnplay',
			'M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z',
		),
		svgButton(
			'btnpause',
			'M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z',
		),
	),
	nowPlayingBtnSkipForwardElem = el.button(
		{ id: 'skip' },
		svgButton(
			'skipfwd',
			'M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z',
		),
	),
	nowPlayingVList = el.div(
		{ class: 'verticallist' },
		nowPlayingTitle = el.div({ class: 'vlitem', id: 'nowplaying_title' }),
		nowPlayingArtist = el.div({
			class: 'vlitem',
			id: 'nowplaying_artist',
		}),
		nowPlayingFilename = el.div({
			class: 'vlitem',
			id: 'nowplaying_filename',
		}),
	),
	nowPlayingAudio = el.audio({ src: '...' }),
)

document.body.appendChild(nowPlayingElem)

export let songListColumn: HTMLDivElement
export let songListSearchField: HTMLInputElement
export let songListElem: HTMLUListElement
export let songLyricsColumn: HTMLDivElement
export let nowPlayingLyrics: HTMLParagraphElement

export const columnView = el.div(
	{ class: 'columns' },
	songListColumn = el.div(
		{ class: 'column' },
		songListSearchField = el.input({
			id: 'search',
			type: 'text',
			placeholder: 'Search...',
		}),
		songListElem = el.ul({ id: 'songlist' }, '...'),
	),
	songLyricsColumn = el.div(
		{ class: 'column' },
		nowPlayingLyrics = el.p({ id: 'nowplaying_lyrics' }, '...'),
	),
)

document.body.appendChild(columnView)
