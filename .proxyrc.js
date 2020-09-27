const serveIndex = require('serve-index')
const serveStatic = require('serve-static')
const os = require("os");
const path = require("path");
const cache = require("./dist/cache.js");
const util = require("util");
const express = require("express");

const rootMusicDir = path.join(os.homedir(), "Music");

const app = express();

app.use("/music", serveStatic(rootMusicDir, {index: false}));
app.use("/music", serveIndex(rootMusicDir, {}));
app.use(serveStatic(path.join(__dirname, "static"), {index: false}));
// process.stdout.write(util.inspect(app));
const subr = express();
subr.get("*", async (req, res) => {
	const file = decodeURIComponent(req.url);
	if(!file) return res.json({error: "Bad request"})
	const resolved = path.join(rootMusicDir, file);
	console.log(resolved);
	if(!resolved.startsWith(rootMusicDir+"/")) return res.json({error: "Cannot go up"});
	var value;
	try {
		value = await cache.readTagsNoLock(resolved)
	}catch(e) {
		return res.json({error: "Failed to get cache"});
	}
	return res.json({value});
})
app.use("/tags/music", subr);
app.get("/", (req, res) => res.redirect("/player_web.html"));

module.exports = function (someapp) {
	someapp.use(app);
}