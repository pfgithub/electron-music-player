const serveIndex = require('serve-index')
const serveStatic = require('serve-static')
const os = require("os");
const path = require("path");
const cache = require("./dist/cache.js");

const rootMusicDir = path.join(os.homedir(), "Music");

module.exports = function (app) {
	// Use static middleware
	// app.use("/test", (req, res, next) => res.send("Hello, World!"));
	app.use("/music", serveStatic(rootMusicDir, {index: false}));
	app.use("/music", serveIndex(rootMusicDir, {}));
	app.use(serveStatic(path.join(__dirname, "static"), {index: false}));
	// next: /tags?file={}
	// eg /tags/File One.mp3 or /tags/Folder One/File Two.mp3
	app.get("/tags", (req, res) => {
		const file = req.query.file;
		if(!file) return res.json({error: "Bad request"})
		const resolved = path.join(rootMusicDir, file);
		if(!resolved.startsWith(rootMusicDir+"/")) return res.json({error: "Cannot go up"});
		cache.readTagsNoLock(resolved)
		.catch(e => {res.json({error: "Failed to get cache"})})
		.then(tags => {res.json({value: tags})});
	});
}