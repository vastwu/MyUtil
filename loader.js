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
    var STATUS = {
        unload:1,
        loading:2,
        ready:3
    };
    var Module = function(name, factory, deps, isProxy){
        this.name = name;
        this.deps = deps;
        this.factory = factory;
        this.exports = {};
        this.status = STATUS.loading;
        this.isProxy = isProxy;
        this.callbacks = [];
        //who depend me
        this.waitings = {};
    };
    Module.prototype.init = function(){    
        if(this.status === STATUS.ready || this.isProxy){
            return;
        }           
        if(!this.deps || this.deps.length == 0){
            var exports = {}; 
            this.exports = this.factory.apply(exports, [Loader.require, exports, this]) || exports;
            this.status = STATUS.ready;
            while(this.callbacks.length){
                var h = this.callbacks.shift();
                h.call(this, this.exports);
            }
            this.clear();
            return;
        }
        var self = this; 
        for(var i = 0, n = this.deps.length; i < n; i++ ){
            Loader.require(this.deps[i], function(exports){   
                if(self.deps){             
                    for(var j = 0, m = self.deps.length; j < m; j++){
                        if(self.deps[j] == this.name){
                            self.deps.splice(j, 1);
                            break;
                        }
                    }
                }
                if(!self.deps || self.deps.length <= 0){
                    self.init();
                }                    
            });
        }    
    };
    Module.prototype.onInit = function(handler){
        this.callbacks.push(handler);
    };
    Module.prototype.merge = function(module){
        this.name = module.name || this.name;
        this.factory = module.factory;
        this.deps = module.deps;
        this.status = module.status;

        this.isProxy = false;
    };
    Module.prototype.clear = function(){
        this.factory = null;
        this.callbacks = null;
        this.deps = null;;
    };
    var modules = {};
    var unnamedModules = [];
    var Loader = {  
        scriptCallback:function(path){
            var m = modules[path];
            if(unnamedModules[0]){
                m.merge(unnamedModules.pop());                        
            }                   
            m.init();  
        },      
        define:function(moduleName, deps, factory){
            if(arguments.length == 1){
                factory = moduleName;
                moduleName = null;
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
            var m = new Module(moduleName, factory, deps);
            if(!moduleName){
                unnamedModules.push(m);
            }else if(modules[moduleName] && modules[moduleName].isProxy){
                modules[moduleName].merge(m);
            }else{
                modules[moduleName] = m;  
            }
            deps = null;
            s = null;
        },
        require:function(modulePath, callback){
            var m = modules[modulePath];
            if(!m){
                m = modules[modulePath] = new Module(modulePath, null, null, true);
                if(callback){
                    m.onInit(callback);
                }
                loadScript(modulePath, Loader.scriptCallback);
                // callback = null;
                return;
            }
            m.init();  
            if(m.status == STATUS.loading){
                m.onInit(callback);
                // callback = null;
                return;
            }else if(m.status == STATUS.ready){
                if(callback){
                    // keep async
                    setTimeout(function(){
                        callback.call(m, m.exports);
                        // callback = null;
                    }, 13);
                }
                return m.exports;
            }              
        }
    };
    global.define = Loader.define;
    global.require = Loader.require;
})(window);