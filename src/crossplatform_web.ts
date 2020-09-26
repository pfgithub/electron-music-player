//@ts-ignore
import Color_ from "color";
import * as mm from "music-metadata-browser";
//@ts-ignore
import * as Vibrant from "node-vibrant";
//@ts-ignore
import * as uhtml from "uhtml";

const fetch = (window as any).fetch;
const enableIPC = false;
const isWeb = true;
export {Color_, mm, Vibrant, uhtml, fetch, isWeb, enableIPC};
