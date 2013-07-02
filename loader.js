;(function(global){
    var REQUIRE_REG = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
    var loadScript = function(src, onload){
        var script = document.createElement('script');
        script.src = src;
        script.onload = function(){
            onload && onload(src);
            document.body.removeChild(script);
            script.onload = null;
            script = null;
            onload = null;
            src = null;
        };
        document.body.appendChild(script);
    };
    function isType(type) {
        return function(obj) {
            return Object.prototype.toString.call(obj) === "[object " + type + "]"
        }
    }
    var isObject = isType("Object");
    var isString = isType("String");
    var isArray = Array.isArray || isType("Array");
    var isFunction = isType("Function");
    var STATUS = {
        unload:1,
        loading:2,
        loaded:3,
        ready:4
    };
    var Module = function(name, factory, deps){
        this.name = name;
        this.deps = deps;
        this.factory = factory;
        this.exports = {};
        this.status = STATUS.unload;
        this.callbacks = [];
        this.waiting = {};
    };
    Module.prototype.init = function(){    
        if(this.status === STATUS.ready || this.status == STATUS.loading){
            return;
        }else if(this.status < STATUS.loading){
            this.load();
            return;
        }
        var n = this.deps ? this.deps.length : 0;  
        var remain = n;
        //copy deps
        //if deps like ['a.js', 'b.js', 'a.js'],
        //when b.js is ready, this.deps will be release and then, 
        // var copyDeps = this.deps.slice();
        var self = this, m; 
        for(var i = 0; i < n; i++ ){
            //in depsModule.init may be fire this module.init and become ready
            if(this.status == STATUS.ready){
                break;
            }            
            m = getModule(this.deps[i]);
            if(m.status == STATUS.ready){
                 remain--;
            }else{
                m.wait(this.name);
                m.init();              
            }                 
        }     
        if(remain == 0 && this.status !== STATUS.ready){
            // console.log(this.name + ' inited');
            var exports = {}; 
            this.exports = this.factory.apply(exports, [Loader.require, exports, this]) || exports; 
            this.status = STATUS.ready;
            this.factory = null;
            this.deps = null;
            while(this.callbacks.length){
                var h = this.callbacks.shift();
                h.call(this, this.exports);
            }
            for(var p in this.waiting){
                getModule(p).init();
            }
            this.callbacks = null;
            this.waiting = null;
        }        
    };
    Module.prototype.load = function(){
        this.status = STATUS.loading;
        loadScript(this.name, scriptCallback);
    };
    Module.prototype.wait = function(path){
        this.waiting[path] = 1; 
    };
    Module.prototype.onInit = function(handler){
        if(isFunction(handler)){
            this.callbacks.push(handler);
        }        
    };
    Module.prototype.merge = function(module){
        this.name = module.name || this.name;
        this.factory = module.factory;
        this.deps = module.deps;
        this.status = module.status;
    };
    var modules = {};
    var unnamedModules = [];
    var getModule = function(path){
        if(!modules[path]){
            modules[path] = new Module(path, null, null, true);
        }
        return modules[path];
    };
    var scriptCallback = function(path){
        var m = getModule(path);
        if(unnamedModules[0]){
            m.merge(unnamedModules.pop());                     
        }                   
        m.init();  
    };
    var Loader = {     
        define:function(modulePath, deps, factory){
            if(arguments.length == 1){
                factory = modulePath;
                modulePath = null;
            }else if(arguments.length == 2){
                factory = deps;
                deps = null;
            }    
            if(!deps){
                deps = [];
                var s = factory.toString();
                s.replace(REQUIRE_REG, function (match, dep) {
                    deps.push(dep);               
                }); 
            }      
            var m = getModule(modulePath);
            m.factory = factory;
            m.deps = deps;
            m.status = STATUS.loaded;
            if(!modulePath){
                unnamedModules.push(m);
            }
            deps = null;
            s = null;
        },
        require:function(modulePath, callback){
            var m = getModule(modulePath);
            if(m.status !== STATUS.ready){
                m.onInit(callback);
                m.init();
            }else{
                if(isFunction(callback)){
                    // keep async
                    setTimeout(function(){
                        callback.call(m, m.exports);
                    }, 13);
                }
                return m.exports;
            }              
        }
    };
    global.define = Loader.define;
    global.require = Loader.require;
    global.loaderReset = function(){
        modules = {};
        unnamedModules = [];
    };
})(window);