export type Defer = ((cb: () => void) => void) & {cleanup: () => void};
declare global {
	interface Window {
		el: typeof document.createElement;
		txt: (t: string) => Text;
		anychange: (items: (HTMLInputElement | HTMLTextAreaElement)[], cb: () => void) => () => void;
		body: HTMLElement;
		makeDefer: () => Defer;
	}
	let el: Window["el"];
	let txt: Window["txt"];
	let anychange: Window["anychange"];
	let body: Window["body"];
	let makeDefer: Window["makeDefer"];
	interface Node {
		attr: <T extends HTMLElement>(this: T, attrs: {[key: string]: string}) => T;
		adto: <T extends Node>(this: T, prnt: Node) => T;
		adch: <T extends Node>(this: T, ...chld: Node[]) => T;
		atxt: <T extends Node>(this: T, txta: string) => T;
		onev<K extends keyof DocumentEventMap, T extends Node>(this: T, type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): T;
		onev<T extends Node>(this: T, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): T;
		drmv: <T extends Node>(this: T, defer: Defer) => T;
		clss: <T extends Node>(this: T, ...clss: string[]) => T;
		styl: <T extends HTMLElement>(this: T, styls: {[key: string]: string}) => T;
	}
	interface Object {
		dwth: <T>(this: T, cb: (v: T) => any) => T;
	}
}

//@ts-ignore
window.el = (nme) => document.createElement(nme);
window.txt = (txt: string) => document.createTextNode(txt);
window.anychange = (itms, cb) => {itms.forEach(itm => itm.oninput = () => cb()); cb(); return cb;};
window.body = document.getElementById("maincontent") || document.body;
Node.prototype.attr = function(atrs) {Object.entries(atrs).forEach(([k, v]) => this.setAttribute(k, v)); return this;};
Node.prototype.adto = function(prnt) {prnt.appendChild(this); return this;};
Node.prototype.adch = function(...chld) {chld.forEach(ch => this.appendChild(ch)); return this;};
Node.prototype.atxt = function(txta) {this.appendChild(txt(txta)); return this;};
//@ts-ignore
//eslint-disable-next-line
Node.prototype.onev = function(...a) {this.addEventListener(...a); return this;};
Node.prototype.drmv = function(defer) {defer(() => (this as any).remove()); return this;};
Node.prototype.clss = function(...clss) {clss.forEach(clitm => clitm.split(/[. ]/g).filter(q => q).map(itm => (this as any).classList.add(itm))); return this;};
Node.prototype.styl = function(styl) {Object.entries(styl).forEach(([k, v]) => this.style.setProperty(k, v)); return this;};
// dwth causes issues with the bad "for(var itm in obj)" so it has to be removed
//Object.prototype.đwth = function(cb) {console.log(cb); cb(this); return this;};
Object.defineProperty(Array.prototype, "last", {enumerable: false, get: function() {return this[this.length - 1]}});
Object.defineProperty(Object.prototype, "dwth", {enumerable: false, value: function(cb: any) {cb(this); return this;}});

window.makeDefer = () => {
	const list: (() => void)[] = [];
	const res = (cb: () => void) => {list.unshift(cb)};
	res.cleanup = () => {list.forEach(cb => cb())};
	return res;
};
