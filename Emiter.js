define(function() {
    var eventHandlerStorage = {};
    var idIndex = 0;
    var EMPTY = function() {};
    /**
     * 事件派发器
     * @private
     * @constructs Emiter
     * @alias BMapCom.Emiter
     */
    var Emiter = function() {
        this._eid = 'eid' + (++idIndex);
        eventHandlerStorage[this._eid] = {};
    };

    Emiter.prototype = {
        /** @lends Emiter.prototype */
        /**
         * 获取该类型下的所有事件句柄
         * @param  {String} evt 事件类型
         * @return {Object}     事件句柄key->value
         */
        getEvents: function(evt) {
            if (!this.hasOwnProperty('_eid')) {
                this._eid = 'eid' + (++idIndex);
                eventHandlerStorage[this._eid] = {};
            }
            if (evt && !eventHandlerStorage[this._eid][evt]) {
                return null;
            }
            return evt ? eventHandlerStorage[this._eid][evt] : eventHandlerStorage[this._eid];
        },
        /**
         * 监听事件
         * @param  {String} evt     事件类型
         * @param  {Function} handler 事件句柄
         * @return {Function}         事件句柄
         */
        on: function(evt, handler) {
            if (!this.hasOwnProperty('_eid')) {
                this._eid = 'eid' + (++idIndex);
                eventHandlerStorage[this._eid] = {};
            }
            var handlers = eventHandlerStorage[this._eid];
            if (!handlers[evt]) {
                handlers[evt] = [];
            }
            handlers[evt].push(handler);
            return handler;
        },
        once:function(evt, handler) {
            var self = this;
            var onceHandler = function() {
                handler.apply(this, arguments);
                return true;
            };
            return this.on(evt, onceHandler);
        },
        /**
         * 移除监听事件
         * @param  {String} evt     事件类型
         * @param  {Function} handler 事件句柄
         */
        off: function(evt, handler) {
            var es = this.getEvents();
            if (!es || !es[evt]) {
                return;
            }
            es = es[evt];
            for (var i = 0, n = es.length; i < n; i++) {
                if (es[i] === handler) {
                    es.splice(i, 1);
                    break;
                }
            }
        },
        /**
         * 移除监听事件
         * @param  {String} evt     事件类型
         * @param  {Function} handler 事件句柄
         */
        emit: function(evt, args, context) {
            if (this['on_' + evt]) {
                this['on_' + evt].apply(this, args);
            }
            var es = this.getEvents();
            if (!es || !es[evt]) {
                return;
            }
            es = es[evt];
            for (var i = 0, n = es.length; i < n; i++) {
                if (es[i].apply(context || this, args) === true) {
                    this.off(evt, es[i]);
                    i--;
                    n--;
                }
            }
        },
        /**
         * 销毁事件对象，取消所有事件
         */
        destory: function() {
            eventHandlerStorage[this._eid] = {};
        }
    };

    return Emiter;
});
