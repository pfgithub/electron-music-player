import { $scss, el } from './qdom'

$scss`
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
	background: linear-gradient(
		to top,
		var(--background2),
		var(--background)
	);
	box-shadow: 0px 20px 20px 0px var(--background2);
	position: sticky;
	top: 0;
	display: flex;
	-webkit-app-region: drag;
	& > * {
		-webkit-app-region: no-drag;
	}
}
`

// reminder: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518

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
		{ id: 'previous', class: 'menubtn' },
		el.span({ class: 'fonticon skipback' }, '\ue801'),
	),
	nowPlayingBtnPlaypauseElem = el.button(
		{ id: 'playpause', class: 'menubtn' },
		el.span({ class: 'fonticon btnplay' }, '\ue800'),
		el.span({ class: 'fonticon btnpause' }, '\ue803'),
	),
	nowPlayingBtnSkipForwardElem = el.button(
		{ id: 'skip', class: 'menubtn' },
		el.span({ class: 'fonticon skipfwd' }, '\ue802'),
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
