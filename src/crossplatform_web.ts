//@ts-ignore
import * as uhtml from "uhtml";

const fetch = (window as any).fetch;
const enableIPC = false;
const isWeb = true;
export {uhtml, fetch, isWeb, enableIPC};
