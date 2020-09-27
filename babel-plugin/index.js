Object.defineProperty(exports, "__esModule", {
  value: true
});
module.exports.default = function({ types: t }) {
  return {
    visitor: {
      Program: {
        enter: () => {},
        exit: () => {}
      },
      ImportDeclaration(path) {
        if(path.node.source.value === "./crossplatform") {
          path.node.source.value = "./crossplatform_web";
      }else if(path.node.source.value === "./crossplatform_node") {
          path.node.source.value = "././crossplatform_web";
        }
      }
    }
  };
};
