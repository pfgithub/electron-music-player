import * as fs from "fs"; // .promises
import * as os from "os";
import * as path from "path";
//@ts-ignore
import Color_ from "color";
import * as mm from "music-metadata";
//@ts-ignore
import * as Vibrant from "node-vibrant";
//@ts-ignore
import * as ffmetadata_ from "ffmetadata";
import * as child_process from "child_process";
import * as uhtml from "uhtml";
import * as ipc from "node-ipc";
import * as notifier from "node-notifier";
import fetch from "node-fetch";
const Lyricist = (window as any)["require"]("lyricist");
const Genius = (window as any)["require"]("node-genius");

export {fs, os, path, Color_, mm, Vibrant, ffmetadata_, child_process, uhtml, ipc, notifier, fetch, Lyricist, Genius};
export const enableIPC = true;
export const isWeb = false;