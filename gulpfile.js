const vm = require("vm");

const sandbox = { require, exports: module.exports };
vm.createContext(sandbox);

vm.runInContext(
    require("typescript").transpile(
        require("fs")
            .readFileSync("./gulpfile.ts")
            .toString(),
    ),
    sandbox,
);
