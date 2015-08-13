;(function(global){
    var __n = 0;
    var getRandom = function(){
        return 'r' + (__n++);
    };
    var REQUIRE_REG = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
    var COMMENTS_REG = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
    var root_path = "";
    var SCRIPT_PATH_KEY = 'module-path';
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var baseElement = head.getElementsByTagName("base")[0];
    var loadScript = function(src, onload){
        var script = document.createElement('script');
        script.src = getCorrectPath(src);
        script.setAttribute(SCRIPT_PATH_KEY, src);
        var onloadHandler = function(){
            if(this.parentNode){
                onload && onload(src);
                head.removeChild(script);
                script.onload = null;
                script = null;
                onload = null;
                src = null;
            }
        };
        script.onload = onloadHandler;
        //for ie bug, before domready, no onload event
        script.onreadystatechange = function(){
            if (this.readyState === "complete" || this.readyState === "loaded") {
                onloadHandler.call(this);
            }
        };
        // For some cache cases in IE 6-8, the script executes IMMEDIATELY after
        // the end of the insert execution, so use `currentlyAddingScript` to
        // hold current node, for deriving url in `define` call
        currentlyAddingScript = script
        baseElement ?
              head.insertBefore(script, baseElement) :
              head.appendChild(script)
        currentlyAddingScript = null
    };
    var getCorrectPath = function(moduleName){
        return root_path + moduleName;
    };
    var getPath = function(moduleName){
        return moduleName.substr(0, moduleName.lastIndexOf('/'));  
    };
    var isRelativePath = function(path){
        return path.substr(0, 2) === './';
    }
    var cleanPath = function(path){
        if(!path){
            return path;
        }
        var clean = []; 
        var paths = path.split('/');
        while(paths.length){
            var p = paths.shift();
            if(p === '.' && clean.length > 0){
             
            }else if(p === '..' && clean.length > 0 && clean[clean.length - 1] !== '..'){
                clean.pop(); 
            }else{
                clean.push(p);
            }
        }
        return clean.join('/');
    }
    var interactiveScript;
    var currentlyAddingScript;
    function getCurrentScript() {
        if (currentlyAddingScript) {
            return currentlyAddingScript
        }

      // For IE6-9 browsers, the script onload event may not fire right
      // after the script is evaluated. Kris Zyp found that it
      // could query the script nodes and the one that is in "interactive"
      // mode indicates the current script
      // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript
        }
        var scripts = head.getElementsByTagName("script")

        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i]
            if (script.readyState === "interactive") {
              interactiveScript = script
              return interactiveScript
            }
        }
    }
    var loadCSS = function(link){
        var style = document.createElement('link');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.href = link;
        document.getElementsByTagName('head')[0].appendChild(style);
    };
    var isType = function(type) {
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
        this.cssdeps = [];
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
        var cssdeps = [];
        var jsdeps = this.deps;
        if(!jsdeps){
            //get path 
            var p = this.name;
            var currectPath = getPath(p);
            jsdeps = [];
            var s = clearComments(this.factory.toString());
            s.replace(REQUIRE_REG, function (match, dep) {
                if(dep.substr(-4) === '.css'){
                    cssdeps.push(dep);
                }else{
                    if(isRelativePath(dep) && currectPath){
                        dep = dep.replace('./', currectPath + '/');
                    }
                    jsdeps.push(dep);               
                }
            }); 
        } 
        this.deps = jsdeps;
        while(cssdeps.length){
            loadCSS(cssdeps.pop());
        }
        var n = jsdeps ? jsdeps.length : 0;  
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
            m = getModule(jsdeps[i]);
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
            var self = this;
            var runtimeRequire = function(){
                return Loader.require.apply(self, arguments);
            };
            var output = this.factory.apply(exports, [runtimeRequire, exports, this]) ;
            runtimeRequire = null;
            this.exports = output === undefined ? exports : output;
            // this.exports = this.factory.apply(exports, [Loader.require, exports, this]) || exports; 
            this.status = STATUS.ready;
            this.factory = null;
            this.deps = null;
            this.cssdeps = null;
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
        this.cssdeps = module.cssdeps;
        this.status = module.status;
    };

    var clearComments = function (code) {
        return code.replace(COMMENTS_REG, '');
    };
    var modules = {};
    var unnamedModules = [];
    var getModule = function(path){
        path = cleanPath(path);
        if(!modules[path]){
            modules[path] = new Module(path, null, null, true);
        }
        return modules[path];
    };
    
    var scriptCallback = function(path){
        path = cleanPath(path);
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
            // Try to derive uri in IE6-9 for anonymous modules
            if(document.attachEvent && !modulePath){
                var script = getCurrentScript();
                if(script){
                    modulePath = script.getAttribute(SCRIPT_PATH_KEY);    
                }
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
            if(this instanceof Module && isRelativePath(modulePath)){
                modulePath = modulePath.replace('./', getPath(this.name) + '/');
            }
            if(isArray(modulePath) && callback){
                var rn = '_$M' + getRandom();
                Loader.define(rn, modulePath, function () {
                    var exports = [];
                    for(var i = 0, n = modulePath.length; i < n; i++){
                        // exports[modulePath[i]] = Loader.require(modulePath[i]);
                        exports.push(Loader.require(modulePath[i]));
                    }
                    callback.apply(null, exports);
                });
                Loader.require(rn, function(){});
                return;
            }
            if(modulePath.substr(-4) === '.css'){
                return;
            }
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
        },
        config:function(config){
            if(config.root){
                root_path = config.root;
            }
        }   
    };
    var NAMESPACE = 'vLoader';
    global[NAMESPACE] = {};
    global.define = Loader.define;
    global.require = Loader.require;
    global[NAMESPACE].config = Loader.config;

    var scripts = document.getElementsByTagName('script')
        var loaderScript = scripts[scripts.length - 1]; //parsedOne

    var mainPath = loaderScript.getAttribute('data-main');
    if(mainPath){
        require(mainPath, function(){});
    }

    //便于测试用接口，正式环境可以忽略
    global.loaderReset = function(){
        modules = {};
        unnamedModules = [];
    };

    

})(window);
