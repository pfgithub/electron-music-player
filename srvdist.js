const serveStatic = require('serve-static');

const express = require("express");
const app = express();
const port = 3000;

app.use("/", serveStatic(__dirname + "/dist_web", {index: false}));
app.use("/", serveStatic(__dirname + "/web_public", {index: false}));
app.get("/", (req, res) => res.redirect("/links.html"));
require("./.proxyrc.js")(app)

app.listen(port, () => console.log("http://localhost:"+port))
