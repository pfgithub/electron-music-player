const serveIndex = require('serve-index')
const serveStatic = require('serve-static')
const os = require("os");
const path = require("path");

module.exports = function (app) {
	// Use static middleware
	// app.use("/test", (req, res, next) => res.send("Hello, World!"));
	app.use("/music", serveStatic(path.join(os.homedir(), "Music"), {index: false}));
	app.use("/music", serveIndex(path.join(os.homedir(), "Music"), {}));
	app.use(serveStatic(path.join(__dirname, "static"), {index: false}));
	// next: /tags?file={}
	// eg /tags/File One.mp3 or /tags/Folder One/File Two.mp3
	app.get("/tags", (req, res) => {
		const file = req.query.file;
		if(!file) return res.json({error: "Bad request"})
		
	});
}