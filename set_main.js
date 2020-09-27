const fs = require("fs");
let pkg = fs.readFileSync(__dirname + "/package.json", "utf-8");
const setMain = (newmain) => pkg = pkg.replace(/"main": ".*?",/, `"main": ${JSON.stringify(newmain)},`);
if(process.argv.length !== 3) throw new Error("bad args");
if(process.argv[2] === "local") setMain("dist/main.js");
else if(process.argv[2] === "web") setMain("dist_web/main.html");
else throw new Error("Expected local or web, got "+process.argv[2]);
fs.writeFileSync(__dirname + "/package.json", pkg);