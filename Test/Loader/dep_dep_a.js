define(function(require, exports, beta){
    var dep = require('dep_a.js');
    return {
        name:'dep_dep_a',
        dep:dep.name,
        runA:function(){
            
        }
    }
});