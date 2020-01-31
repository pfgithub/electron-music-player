> Note: This project is very WIP.

# electron-music-player

![build passing](https://img.shields.io/badge/build-passing-green.svg)
![zero code coverage](https://img.shields.io/badge/coverage-0%25-red.svg)

---

A simple music player in electron

![screenshot](https://i.imgur.com/ptGmrTa.png)

Colors are set dynamically based on the 0th art of the song that is playing,
enforcing a contrast ratio of at least 3:1

Drag a folder or a set of files to play them

Lyrics are currently read from the Album field of the audio file. (For use with
[mp3lyrics](https://github.com/pfgithub/mp3lyrics))

Supports Linux and Mac. Might support Windows if you're lucky.

## Features

### Dynamic Color

electron-music-player's entire interface's color changes dynamically based on
the album art of the song that is playing. It will always make sure text is
readable using the contrast. The image is read from the 0th album art field of
the mp3 file.

### Lyrics

electron-music-player features a groundbreaking music lyric view never seen
before in any other music player other than the ones it has been seen before in.
Lyrics are read from the album field of the audio file.

### Search

electron-music-player's search lets you search titles and lyrics using a very
advanced searching algorithm that finds the number of occurances of each word in
the search. Future versions of electron-music-player may even sort searches
based on if the occurances were in the title and how many occurances there were.

### Skip Back Button

One of the newest advances in electron-music-player's groundbreaking technology
is the skip back button that allows you to skip to the previous song that was
being played. This is powered by the advanced history tracker built in to
electron-music-player.

### System Integration

electron-music-player fits right into your system, just like any other native
app. Files and folders can be dragged into electron-music-player to add them to
the playlist. Sometimes, the window can be dragged by clicking and dragging on
the now playing section. electron-music-player's web components look and feel
exactly like native web components. On Mac, the traffic light buttons are
beautifully overlayed on the top left corner of electron-music-player,
half-covering the album art of the song that is playing.

### Advanced Shuffle Algorithm

electron-music-player uses one of the most advanced shuffle algorithms there is,
the pseudorandom shuffle. Occasionally, it may even repeat a track immediately
after playing it once, something no other shuffle algorithms do.

### Accessability

electron-music-player has industry-standard accessability support. Screenreader
users can see their list of songs, and maybe even select one of them if they're
lucky.

### Light Mode (experimental)

electron-music-player's experimental light mode can be enabled by setting
config: lightMode: true in player.js. Unlike other light modes in apps,
electron-music-player will only partially burn your eyes out in light mode
thanks to the stunning smooth gradient in the background.

## Setup

```bash
# Clone this repository
git clone https://github.com/pfgithub/electron-music-player
# Go into the repository
cd electron-music-player
# Install dependencies
yarn install
# Run the app
yarn start
```
