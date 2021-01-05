import { Color_, fetch, fs, isWeb, mm, os, path, Vibrant } from "./crossplatform_node";

function getCacheFileName(ctimeMs: number, filename: string, cachetype: string): string | undefined {
    const sysCacheDir = systemCacheDir(appName);
    if(!sysCacheDir) return undefined;
    const lastUpdateTime = ctimeMs;
    const fname = path.basename(filename);
    return path.join(sysCacheDir, fname + "-" + cachetype + "-" + lastUpdateTime+".json");
}

async function readCache(filename: string): Promise<{cacheinfo?: SongTags; lastWriteTime?: number}> {
    if(isWeb) return {};
    const fstat = await fs.promises.stat(filename);
    const cfname = getCacheFileName(fstat.ctimeMs, filename, "tags");
    if(!cfname) return {};
    try {
        const json = JSON.parse(await fs.promises.readFile(cfname, "utf-8"));
        json.arturl = getArtURL(json);
        return {lastWriteTime: fstat.ctimeMs, cacheinfo: json};
    }catch(e) {
        return {lastWriteTime: fstat.ctimeMs};
    }
}
async function writeCache(filename: string, songTags: SongTags, lastWriteTime: number | undefined) {
    if(isWeb) return;
    if(!lastWriteTime) lastWriteTime = (await fs.promises.stat(filename)).mtimeMs; // lastWriteTime ??=
    const cfname = getCacheFileName(lastWriteTime, filename, "tags");
    if(!cfname) return; // cache files are not supported on this platform
    const tagsDupe = {...songTags};
    delete tagsDupe.arturl;
    const jsond = JSON.stringify(tagsDupe);
    try {
        await fs.promises.writeFile(cfname, jsond, "utf-8");
    }catch(e) {
        await fs.promises.mkdir(cfname.substring(0, cfname.lastIndexOf("/")), {recursive: true});
        await fs.promises.writeFile(cfname, jsond, "utf-8");
    }
}
export type SongTags = {
    title?: string;
    artist?: string;
    lyrics?: string;
    artdata: {b64: string; fmt: string} | undefined;
    arturl: string;
    color?: {dark: string; light: string};
};
type RawSongTags = {
    title?: string;
    album?: string;
    picture?: { format: string; data: Buffer }[];
    artist?: string;
};
export type ColorProperty = {
    dark: string;
    light: string;
};

async function readTagsNoLock(filename: string) {
    const cache = await readCache(filename);
    if(cache.cacheinfo) return cache.cacheinfo;
    let rawTags: RawSongTags;
    try {
        rawTags = await crossPlatformParseFile(filename);
    }catch(e) {
        console.log("Read tags error on ",filename);
        throw e;
    }
    const songTags: SongTags = {
        lyrics: rawTags.album,
        artist: rawTags.artist,
        title: rawTags.title,
        artdata: undefined,
        arturl: "ERRORNOTSET" as any,
    };
    if (rawTags.picture && rawTags.picture[0]) {
        const allfmt = rawTags.picture[0].format;
        songTags.artdata = {fmt: allfmt.substr(allfmt.lastIndexOf("/") + 1), b64: rawTags.picture[0].data.toString("base64")};
        try {
            const artBuffer = isWeb ? getArtURL(songTags) : rawTags.picture[0].data;
            songTags.color = await getDarkLight(artBuffer);
        }catch(e) {
            // console.log("Failed to load art", e);
            songTags.color = { dark: "#000", light: "#fff" };
        }
    } else {
        songTags.color = { dark: "#a00", light: "#fff" };
    }
    songTags.arturl = getArtURL(songTags);
    try {
        await writeCache(filename, songTags, cache.lastWriteTime);
    }catch(e) {
        console.log("Failed to write cache", e)
    }  
    return songTags;
}
function getArtURL(songTags: SongTags) {
    if(!songTags.artdata) return "img/no_art.png";
    return "data:image/"+songTags.artdata.fmt+";base64,"+songTags.artdata.b64;
}


function realEncodeURI(uri: string) {
    return encodeURI(uri).replace(/[\?#]/g, ([v]) => encodeURIComponent(v));
}

async function crossPlatformParseFile(filename: string): Promise<SongTags> {
    if(isWeb) {
        const data = await fetch(realEncodeURI(filename));
        const stream = await (data.body as any);
        const parsed = await mm.parseReadableStream(stream, {fileInfo: {path: filename}});
        return parsed.common;
    }else {
        const v = await mm.parseFile(filename, {});
        return v.common;
    }
}

const appName = "electron-music-player";
function systemCacheDir(appName: string): string | undefined {
    if(isWeb) return undefined;
    switch(os.platform()) {
        case 'darwin':
            return path.join(os.homedir(), 'Library', 'Caches', appName);
        case 'win32':
            const appData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
            return path.join(appData, appName, 'Cache');
        case 'aix':
        case 'android':
        case 'freebsd':
        case 'linux':
        case 'netbsd':
        case 'openbsd':
        case 'sunos':
            const cacheHome = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache');
            return path.join(cacheHome, appName);;
        default:
            return undefined;
    }
}
async function getDarkLight(imgbuffer: string | Buffer): Promise<ColorProperty> {
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

    return { dark: dark.hex(), light: light.hex() };
}
type Color = {
    hex: () => string;
    contrast: (other: Color) => number;
    darken: (step: number) => Color;
    lighten: (step: number) => Color;
};
const Color: (hex: string) => Color = Color_;


const config = {
    minContrast: 5.0,
    constrastStepChange: 0.25, // How quickly to change background and foreground colors when fixing contrast,
    lightMode: false,
    updateSpeedLimit: 1000, // Minimum ms allowed between each update of the music list. Higher means songs update in larger groups.
    maxMusicSearchDepth: 10, // Max search depth of folders in music added
};

export {config, getArtURL, getDarkLight, readTagsNoLock, realEncodeURI };
