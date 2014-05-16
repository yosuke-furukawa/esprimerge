var esprimerge = require("../index");

var assert = require("power-assert");
describe('Esprimerge', function(){
  describe('#merge()', function(){
    it('hogehoge', function(){
      var src = " var test1 = 123; var test4=234; var test5 =111;";
      var dest = " var test1 = 234; var test2=123; var test3=123;";
      var expected = "var test1 = 123; var test2=123; var test3=123; var test4=234; var test5=111;";
      esprimerge.merge(src, dest);
    });
  });
});

