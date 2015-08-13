define(function(require, exports, beta){
	var b = require('./b.js');
	var c = require('relative/c.js');
    return {
        name:'ra' + b.name + c.name,
        runA:function(){
            
        }
    }
});