var esprima = require('esprima');
var rocambole = require('esprima');
var escodegen = require('escodegen');
var estraverse = require('estraverse');
var shallowEqual = require('shallow-equals');

module.exports = new Esprimerge();

function Esprimerge(){
  this.mergedTree = { src:{}, dest:{}};
  this.parentTree = { src:{}, dest:{}};
  this.srcId = 0;
  this.destId = 0;
}

Esprimerge.prototype.merge = function(srcCode, destCode) {
  var srcAst = esprima.parse(srcCode);
  var destAst = esprima.parse(destCode);
  this._mergeAst(srcAst, destAst);
  
};

Esprimerge.prototype.store = function(key, node, parent) {
  var id = 0;
  if (key === "src") {
    id = this.srcId++;
  } else {
    id = this.destId++;
  }
  this.mergedTree[key][id] = node;
  this.parentTree[key][id] = parent;
};

Esprimerge.prototype.shallowMatch = function(obj1, obj2) {
  var result = true;
  Object.keys(obj1).forEach(function(key1) {
    if (obj1[key1]+"" !== obj2[key1]+"") {
      result = false;
      return;
    }
  });
  return result;
};

Esprimerge.prototype._mergeAst = function(srcAst, destAst) {
  var store = this.store.bind(this);
  var controller = new estraverse.Controller();
  estraverse.traverse(srcAst, {
    enter: function (node, parent) {
      store("src", node, parent);
    }
  });
  var that = this;
  estraverse.traverse(destAst, {
    enter: function (node, parent) {
      this.id = this.id || 0;
      var srcNode = that.mergedTree.src[this.id];
      var parentSrcNode = that.parentTree.src[this.id];
      if (srcNode && !that.shallowMatch(srcNode, node)) {
        if (node.type === "Identifier") {
          node.addParent = parentSrcNode;
          this.addParent = true;
        } else {
          if (!this.addParent) {
            this.addParent = false;
            node.modify = srcNode;
          }
        }
      }
      store("dest", node);
      this.id++;
    }
  });
  controller.enter = function (node, parent) {
    console.log("MODIFY: ", node.modify);
    if (node.modify) return node.modify;
  };
  controller.leave = function (node, parent) {
    console.log("ADD: ", node.addParent);
    console.log(parent);
    if (node.addParent) return parent.body.push(node.addParent);
  };
  var replaced = estraverse.replace(this.mergedTree.dest[0], controller);

  console.log(escodegen.generate(replaced));
};
