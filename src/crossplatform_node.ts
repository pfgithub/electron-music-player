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
import * as ipc from "node-ipc";
// to fix this error, change config.
// doing import * as notifier causes this to break so don't.
import notifier from "node-notifier";
import fetch from "node-fetch";

export {fs, os, path, Color_, mm, Vibrant, ffmetadata_, child_process, ipc, notifier, fetch};
export const enableIPC = true;
export const isWeb = false;
