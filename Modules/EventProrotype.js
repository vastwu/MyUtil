
define(function(require, exports, beta){
    var eventHandlerStorage = {};
    var idIndex = 0;
    var Event = {
        getEvents:function(evt){
            if(!this._eid || 
                !eventHandlerStorage[this._eid] || 
                (evt && !eventHandlerStorage[this._eid][evt])){
                return null;
            }
            return evt ? eventHandlerStorage[this._eid][evt] : eventHandlerStorage[this._eid];
        },
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
            var es = this.getEvents();
            if(!es || !es[evt]){
                return;
            }
            es = es[evt];
            for(var i = 0, n = es.length; i < n; i++){
                if(es === handler){
                    es.splice(i, 1);
                    break;
                }
            }
        },
        fire:function(evt, args){
            var es = this.getEvents();
            if(!es || !es[evt]){
                return;
            }
            es = es[evt];
            for(var i = 0, n = es.length; i < n; i++){
                if(es[i].apply(this, args) === true){
                    this.off(evt, es[i]);
                }
            }
        }
    };
    return Event;
});