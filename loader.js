;(function(global){
    var REQUIRE_REG = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
    var loadScript = function(src, onload, onerror){
        var script = document.createElement('script');
        script.src = src;
        script.onload = function(evt){
            onload && onload(evt);
            document.body.removeChild(script);
            script.onload = null;
            script = null;
        };
        script.onerror = onerror;
        document.body.appendChild(script);
    };
    var eventHandlerStorage = {};
    var idIndex = 0;
    var Event = {
        on:function(evt, handler){
            if(!this._eid){
                this._eid = 'eid' + (++idIndex);
                eventHandlerStorage[this._eid] = {};
            }
            var handlers = eventHandlerStorage[this._eid];
            if(!handlers[evt]){
                handlers[evt] = [];
            }
            handlers[evt].push(handler);
            return handler;
        },
        off:function(evt, handler){
            if(!this._eid || 
                !eventHandlerStorage[this._eid] || 
                !eventHandlerStorage[this._eid][evt]){
                return;
            }
            var es = eventHandlerStorage[this._eid][evt];
            for(var i = 0, n = es.length; i < n; i++){
                if(es === handler){
                    es.splice(i, 1);
                    break;
                }
            }
        },
        fire:function(evt, args){
            if(!this._eid || 
                !eventHandlerStorage[this._eid] || 
                !eventHandlerStorage[this._eid][evt]){
                return;
            }
            var es = eventHandlerStorage[this._eid][evt];
            for(var i = 0, n = es.length; i < n; i++){
                if(es[i].apply(this, args) === true){
                    this.off(evt, es[i]);
                }
            }
        }
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
    };
    Module.prototype.constructor = Module;
    Module.prototype = Event;
    Module.prototype.init = function(){    
        if(this.status === STATUS.ready){
            return;
        }           
        if(this.deps.length == 0){
            var exports = {}; 
            this.exports = this.factory.apply(exports, [Loader.require, exports, this]) || exports;
            this.status = STATUS.ready;
            return this.fire('inited');
        }
        var n = this.deps.length;
        var self = this;
        while(this.deps.length){
            Loader.require(this.deps.pop(), function(){
                n--;
                if(n <= 0){
                    self.init();
                }
            });
        }        
    };
    Module.prototype.merge = function(module){
        for(var evt in module.events){
            if(!this.events[evt]){
                this.events[evt] = [];
            }
            while(module.events[evt].length){
                this.events[evt].push(module.events[evt].shift());
            }
        }
        this.name = module.name;
        this.factory = module.factory;
        this.deps = module.deps;
        this.status = module.status;

        this.isProxy = false;
    };
    var modules = {};
    var unnamedModules = [];
    var Loader = {        
        define:function(moduleName, factory){
            if(arguments.length == 1){
                factory = moduleName;
                moduleName = undefined;
            }
            var s = factory.toString();
            var deps = [];
            s.replace(REQUIRE_REG, function (match, dep) {
                deps.push(dep);               
            });
            var m = new Module(moduleName, factory, deps);
            if(!moduleName){
                unnamedModules.push(m);
            }else if(modules[moduleName] && modules[moduleName].isProxy){
                modules[moduleName].merge(m);
            }else{
                modules[moduleName] = m;  
            }
        },
        require:function(modulePath, callback){
            var m = modules[modulePath];
            if(!m){
                modules[modulePath] = new Module(modulePath, null, null, true);
                loadScript(modulePath, function(evt){
                    m = modules[modulePath];
                    if(unnamedModules[0]){
                        var unnamedM = unnamedModules.pop();
                        m.merge(unnamedM);                        
                    }                   
                    if(callback){
                        m.on('inited', function(){
                            callback(m.exports);
                            return true;
                        });
                    }
                    m.init();                        
                });
                return;
            }
            m.init();  
            if(m.status == STATUS.loading){
                m.on('inited', function(){
                    callback(m.exports);
                    return true;
                });
                return;
            }else if(m.status == STATUS.ready){
                callback && callback(m.exports);
                return m.exports;
            }              
        }
    };
    Loader.define('EventProrotype', function(){
        return Event;
    });
    global.define = Loader.define;
    global.require = Loader.require;
})(window);