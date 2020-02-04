import {
    $scss,
    el,
    ElementResolveable,
    QElement,
    resolveElement,
    tb,
    TextBind,
} from "./qdom";

import * as path from "path";
import * as fs_ from "fs";
const fs = fs_.promises;

const config = {
    maxMusicSearchDepth: 10,
};

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
`;

// reminder: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
class App extends QElement {
    node: ElementResolveable;
    nowPlayingElem: HTMLDivElement;
    nowPlayingArtElem: HTMLImageElement;
    nowPlayingBtnPreviousElem: HTMLButtonElement;
    nowPlayingBtnPlaypauseElem: HTMLButtonElement;
    nowPlayingBtnSkipForwardElem: HTMLButtonElement;
    nowPlayingVList: HTMLDivElement;
    nowPlayingTitle: HTMLDivElement;
    nowPlayingArtist: HTMLDivElement;
    nowPlayingFilename: HTMLDivElement;
    nowPlayingAudio: HTMLAudioElement;

    columnView: HTMLDivElement;
    songListColumn: HTMLDivElement;
    songListSearchField: HTMLInputElement;
    songListElem: HTMLUListElement;
    songLyricsColumn: HTMLDivElement;
    nowPlayingLyrics: HTMLParagraphElement;

    songList: Song[];

    constructor() {
        super();
        this.node = [
            (this.nowPlayingElem = el.div(
                { class: "nowplaying", id: "nowplaying" },
                (this.nowPlayingArtElem = el.img({
                    src: "...",
                    id: "nowplaying_art",
                })),
                (this.nowPlayingBtnPreviousElem = el.button(
                    { id: "previous", class: "menubtn" },
                    el.span({ class: "fonticon skipback" }, "\ue801"),
                )),
                (this.nowPlayingBtnPlaypauseElem = el.button(
                    { id: "playpause", class: "menubtn" },
                    el.span({ class: "fonticon btnplay" }, "\ue800"),
                    el.span({ class: "fonticon btnpause" }, "\ue803"),
                )),
                (this.nowPlayingBtnSkipForwardElem = el.button(
                    { id: "skip", class: "menubtn" },
                    el.span({ class: "fonticon skipfwd" }, "\ue802"),
                )),
                (this.nowPlayingVList = el.div(
                    { class: "verticallist" },
                    (this.nowPlayingTitle = el.div({
                        class: "vlitem",
                        id: "nowplaying_title",
                    })),
                    (this.nowPlayingArtist = el.div({
                        class: "vlitem",
                        id: "nowplaying_artist",
                    })),
                    (this.nowPlayingFilename = el.div({
                        class: "vlitem",
                        id: "nowplaying_filename",
                    })),
                )),
                (this.nowPlayingAudio = el.audio({ src: "..." })),
            )),
            (this.columnView = el.div(
                { class: "columns" },
                (this.songListColumn = el.div(
                    { class: "column" },
                    (this.songListSearchField = el.input({
                        id: "search",
                        type: "text",
                        placeholder: "Search...",
                        $: {
                            keyup: e => {},
                        },
                    })),
                    (this.songListElem = el.ul({ id: "songlist" }, "...")),
                )),
                (this.songLyricsColumn = el.div(
                    { class: "column" },
                    (this.nowPlayingLyrics = el.p(
                        { id: "nowplaying_lyrics" },
                        "...",
                    )),
                )),
            )),
        ];
        this.songList = [];
        this.populateInitialSongList();

        window.main = { ...this };
    }
    populateInitialSongList() {}
    async addMusic(musicPath: string, depth = 1): Promise<void> {
        if (depth > config.maxMusicSearchDepth) {
            return;
        } //workaround for circular symlinks
        const lstat = await fs.stat(musicPath);
        console.log(lstat.isDirectory());
        if (lstat.isSymbolicLink()) {
            // increase depth only on symbolic link (maybe)
        }
        if (lstat.isDirectory()) {
            return (await fs.readdir(musicPath)).forEach(subPath =>
                this.addMusic(path.join(musicPath, subPath), depth + 1),
            );
        }

        // create node

        this.songList.push({
            filename: path.basename(musicPath),
            path: musicPath,
            tags: undefined,
        });
    }
}

class Song extends QElement {
    node: HTMLLIElement;
    playingElem: TextBind;

    filename: string;
    filepath: string;
    tags: any;
    playing: boolean;

    setPlaying(value: boolean) {
        if (this.playing !== value) {
            if (this.playing) {
                this.node.classList.add("playing");
            } else {
                this.node.classList.remove("playing");
            }
        }
        this.playing = value;
    }

    constructor(o: { filename: string; filepath: string; tags: any }) {
        super();
        this.filename = o.filename;
        this.filepath = o.filepath;
        this.tags = o.tags;
        this.playing = false;

        // this.node = el.li(
        // 	{
        // 		role: 'button',
        // 		'aria-pressed': this.playingElem = tb`false`,
        // 		tabindex: '0',
        // 		class: '', // a classlist could be used
        // 		$: {
        // 			click: e => {
        // 				e.preventDefault, playSong(song)
        // 			},
        // 		},
        // 	},
        // 	!song.tags && createLoadingSpinner(),
        // 	song.tags &&
        // 		song.tags.art &&
        // 		el.img({ src: song.tags.art, class: 'icon' }),
        // 	el.span(
        // 		{},
        // 		song.tags && song.tags.title && song.tags.artist
        // 			? `${song.tags.title} by ${song.tags.artist}`
        // 			: `${song.filename}`,
        // 	),
        // )
        // if (song.tags && song.tags.color) {
        // 	if (config.lightMode) {
        // 		li.style.setProperty(
        // 			'--track-foreground',
        // 			song.tags.color.dark.hex(),
        // 		)
        // 		li.style.setProperty(
        // 			'--track-background',
        // 			song.tags.color.light.hex(),
        // 		)
        // 	} else {
        // 		li.style.setProperty(
        // 			'--track-foreground',
        // 			song.tags.color.light.hex(),
        // 		)
        // 		li.style.setProperty(
        // 			'--track-background',
        // 			song.tags.color.dark.hex(),
        // 		)
        // 	}
        // }
    }
}

resolveElement(new App()).map(c => document.body.appendChild(c));
