define(function(require, exports, beta){
    var ACCESS = {
        'PUBLIC':1,
        'PRIVATE':2
    }
    var rn = 0;
    var getRid = function(){
        return '_cr' + (rn++);
    };
    var EMPTY = function(){};
    //扩展实现
    var expandImplement = function(type, name, handler){
        if(arguments.length == 2){
            handler = name;
            name = type;
            type = ACCESS.PUBLIC;
        }
        this._private.handlers[name] = {
            'type':type,
            'handler':handler
        };
    };
    //实例化实现
    var createImplement = function(){
        var instance = {
            '_private':{}
        };        
        var hs = this._private.handlers;
        for(var e in hs){
            if(e !== 'constrctor'){
                instance[e] = hs[e].handler;
            }            
        }
        instance._private['cr'] = this._private.cr;
        hs.constrctor.apply(instance, arguments);
        return instance;
    };
    //继承实现
    var extendImplement = function(){

    };
    var Class = {
        ACCESS:ACCESS,
        declare:function(parentClass, constrctor){
            if(arguments.length == 1){
                constrctor = parentClass;
                parentClass = undefined;
            }
            var builder = {
                '_private':{
                    'super':undefined,
                    'cr':getRid(),
                    'handlers':{
                        'constrctor':constrctor || EMPTY
                    },
                },
                'create':createImplement,
                'expand':expandImplement,
                'extend':extendImplement
            };
            if(parentClass){
                var phs = parentClass._private.handlers;
                for(var e in phs){
                    if(e !== 'constrctor' && phs[e].type !== ACCESS.PRIVATE){
                        builder._private.handlers[e] = phs[e];
                    }            
                }
                builder._private.cr += (',' + parentClass._private.cr);
                builder._private.handlers.constrctor = (function(cc, pc){
                    return function(){
                        pc.apply(this, arguments);
                        cc.apply(this, arguments);
                    };
                })(constrctor, parentClass._private.handlers.constrctor);
            }
            return builder;
        },
        instanceOf:function(instance, Class){
            if(instance._private.cr.indexOf(Class._private.cr) > -1 ){
                return true;
            }
            return false;
        },
        GC:function(instance){
            
        }
    };
    return Class;
});