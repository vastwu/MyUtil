### A Module Loader for the Web

* 功能为requirejs/seajs的子集，直接兼容大部分核心功能，功能单纯，代码更少，连带注释只有300行，压缩前仅有11k
* 借鉴seajs的上千模块依赖测试用例，速度不相上下，具体可见 Test/combo-cmd/vLoadertester.html，同目录下为seajs的测试页


#### usage

###### 普通的使用方式

```javascript
    //moduleA.js
	define(function(){
        return {
            init:function(){}
        }
    });

    require('moduleA.js', function(moduleA){
        main.init();
    });
```

###### 支持批量加载

```javascript
    require(['moduleA.js', 'moduleB.js'], function(moduleA, moduleB){
        moduleA.init();
        moduleB.init();
    });
```

###### 内部依赖处理

```javascript
    define(function(require, exports){
        var a = require('a.js'); //绝对路径
        var b = require(./b.js); //相对当前文件路径
        var c = require(../c.js); //依旧为绝对路径，这个与其他loader可能略有不同
    });
```

###### 导出接口
三种方式优先级由高至低，请勿组合使用（即有第一种的return时，回覆盖2,3的情况）
推荐使用第一种方式

```javascript
    //第一种
    define(function(require, exports){
        return {
            init:function(){}
        }
    });
    //第二种
    define(function(require, exports){
        exports.init = function(){}
    });
    //第三种
    define(function(require, exports, module){
        module.exports = {
            init:function(){}
        }
    });
```

###### 配置项
目前只支持root_path, 作用为在所有require的path前均会添加该路径

```javascript
    vLoader.config({
        root_path:'src/'
    });
```

