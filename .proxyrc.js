const serveIndex = require('serve-index')
const serveStatic = require('serve-static')
const os = require("os");
const path = require("path");

module.exports = function (app) {
	// Use static middleware
	// app.use("/test", (req, res, next) => res.send("Hello, World!"));
	app.use("/music", serveStatic(path.join(os.homedir(), "Music"), {index: false}));
	app.use("/music", serveIndex(path.join(os.homedir(), "Music"), {}));
}