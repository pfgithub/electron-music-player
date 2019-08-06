/* eslint-env node, browser */

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

export const nowPlayingElem = document.createElement('div')
nowPlayingElem.classList.add('nowplaying')
nowPlayingElem.setAttribute('id', 'nowplaying')

export const nowPlayingArtElem = document.createElement('img')
nowPlayingArtElem.src = '...'
nowPlayingArtElem.setAttribute('id', 'nowplaying_art')
nowPlayingElem.appendChild(nowPlayingArtElem)

export const nowPlayingBtnPreviousElem = document.createElement('button')
nowPlayingBtnPreviousElem.setAttribute('id', 'previous')
nowPlayingBtnPreviousElem.appendChild(
	svgButton(
		'skipback',
		'M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z',
	),
)
nowPlayingElem.appendChild(nowPlayingBtnPreviousElem)

export const nowPlayingBtnPlaypauseElem = document.createElement('button')
nowPlayingBtnPlaypauseElem.setAttribute('id', 'playpause')
nowPlayingBtnPlaypauseElem.appendChild(
	svgButton(
		'btnplay',
		'M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z',
	),
)
nowPlayingBtnPlaypauseElem.appendChild(
	svgButton(
		'btnpause',
		'M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z',
	),
)
nowPlayingElem.appendChild(nowPlayingBtnPlaypauseElem)

export const nowPlayingBtnSkipForwardElem = document.createElement('button')
nowPlayingBtnSkipForwardElem.setAttribute('id', 'skip')
nowPlayingBtnSkipForwardElem.appendChild(
	svgButton(
		'skipfwd',
		'M 12,24 20.5,18 12,12 V 24 z M 22,12 v 12 h 2 V 12 h -2 z',
	),
)
nowPlayingElem.appendChild(nowPlayingBtnSkipForwardElem)

export const nowPlayingVList = document.createElement('div')
nowPlayingVList.classList.add('verticallist')

export const nowPlayingTitle = document.createElement('div')
nowPlayingTitle.classList.add('vlitem')
nowPlayingTitle.setAttribute('id', 'nowplaying_title')
nowPlayingVList.appendChild(nowPlayingTitle)

export const nowPlayingArtist = document.createElement('div')
nowPlayingArtist.classList.add('vlitem')
nowPlayingArtist.setAttribute('id', 'nowplaying_artist')
nowPlayingVList.appendChild(nowPlayingArtist)

export const nowPlayingFilename = document.createElement('div')
nowPlayingFilename.classList.add('vlitem')
nowPlayingFilename.setAttribute('id', 'nowplaying_filename')
nowPlayingVList.appendChild(nowPlayingFilename)

nowPlayingElem.appendChild(nowPlayingVList)

export const nowPlayingAudio = document.createElement('audio')
nowPlayingAudio.src = '...'
nowPlayingElem.appendChild(nowPlayingAudio)

document.body.appendChild(nowPlayingElem)

export const columnView = document.createElement('div')
columnView.classList.add('columns')

export const songListColumn = document.createElement('div')
songListColumn.classList.add('column')

export const songListSearchField = document.createElement('input')
songListSearchField.setAttribute('id', 'search')
songListSearchField.type = 'text'
songListSearchField.placeholder = 'Search...'
songListColumn.appendChild(songListSearchField)

export const songListElem = document.createElement('ul')
songListElem.setAttribute('id', 'songlist')
songListElem.appendChild(document.createTextNode('...'))
songListColumn.appendChild(songListElem)

columnView.appendChild(songListColumn)

export const songLyricsColumn = document.createElement('div')
songLyricsColumn.classList.add('column')

export const nowPlayingLyrics = document.createElement('p')
nowPlayingLyrics.setAttribute('id', 'nowplaying_lyrics')
nowPlayingLyrics.appendChild(document.createTextNode('...'))
songLyricsColumn.appendChild(nowPlayingLyrics)

columnView.appendChild(songLyricsColumn)

document.body.appendChild(columnView)
