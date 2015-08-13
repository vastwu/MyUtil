/**
 * @fileOverview dom元素事件代理辅助对象
 * @author vastwu
 *
 */
(function (namespace) {
    var NAME = 'EventDelegate';
    var E = {
        FOCUS:'focus',
        BLUR:'blur'
    };
    /**
     * @class js代理事件辅助类，用于帮助构建dom树事件代理
     * @name EventDelegater
     * @constructor
     * @param {HTMLElement} container dom事件代理顶级元素,所有的事件均由此元素捕获
     * @param {Object} [option] 配置项
     * @param {String} [option.evtAttr=ek] 触发事件的元素标记属性名,只有携带次属性的元素才会响应事件
     */
    var EventDelegater = function(container, option){
        if(!option) option = {};
        this._opt = {
            'evtAttr':option.evtAttr || 'ek'
        };
        this._container = container;
        this._events = {};
        this._eventsCount = {};
        this._listeners = {};
        //判断 p 是否包含 c, p==c视为包含
        var contains = (function(){
            return document.body.contains ?
                function(p, c){
                    return p.contains(c);
                }:
                function(p, c){
                    return !!(p.compareDocumentPosition(c) & 16);
                };
        })();
        this._checkers = {
            //mouseover事件，由自身之外的元素移出,且移入到自身才出发
            'mouseover':function(fromElement, toElement, fireElem){
                if(!fromElement){
                    //由窗口外移入移出可能出现from不存在的情况,此时按触发处理
                    return true;
                }
                return !contains(fireElem, fromElement);
            },
            //mouseout事件，进入到一个自己之外的元素才触发
            //fromElement 移出
            //toElement 移入
            'mouseout':function(fromElement, toElement, fireElem){
                //如果直接移出屏幕外，则按out处理
                if(!toElement){
                    return true;
                }
                return !contains(fireElem, toElement);
            }
        };
        var c = 0;
        this._getRnd = function(){
            return 'eID' + c++;
        };
    };
    EventDelegater.prototype = {
        /**
         * @description 绑定dom事件
         * @param {HTMLElement} elem 绑定事件的元素
         * @param {String} eventType 绑定的事件类型
         * @param {Function} eventHandler 事件处理函数
         * @return {Function} 最终绑定的事件函数,用于移除事件
         */
        _bind:(function(){
            var e = document.createElement('div');
            if ( e.addEventListener ) {
                return function(elem, eventType, eventHandler){
                    var cap = (eventType == E.FOCUS || eventType == E.BLUR) ? true : false;
                    var _handler = function(e){
                        return eventHandler.call(elem, e);
                    };
                    elem.addEventListener( eventType, _handler, cap );
                    return _handler;
                };
            } else if ( e.attachEvent ) {
                return function(elem, eventType, eventHandler){
                    if(eventType == E.FOCUS){
                        eventType = 'focusin';
                    }
                    if(eventType == E.BLUR){
                        eventType = 'focusout';
                    }
                    var _handler = function(e){
                        e.target = e.target ? e.target : e.srcElement;
                        if(!e.fromElement && e.relatedTarget){
                            e.fromElement = e.relatedTarget;
                        }
                        return eventHandler.call(elem, e);
                    };
                    elem.attachEvent( "on" + eventType, _handler );
                    return _handler;
                };
            }
        })(),
        /**
         * @description 移除dom事件
         * @param {HTMLElement} elem 绑定事件的元素
         * @param {String} eventType 绑定的事件类型
         * @param {Function} eventHandler 需要移除的事件函数
         */
        _unbind:(function(){
            var e = document.createElement('div');
            if ( e.removeEventListener ) {
                return function(elem, eventType, eventHandler){
                    var cap = (eventType == E.FOCUS || eventType == E.BLUR) ? true : false;
                    elem.removeEventListener( eventType, eventHandler, cap );
                };
            }else if ( e.detachEvent ) {
                return function(elem, eventType, eventHandler){
                    if(eventType == E.FOCUS){
                        eventType = 'focusin';
                    }
                    if(eventType == E.BLUR){
                        eventType = 'focusout';
                    }
                    elem.detachEvent( "on" + eventType, eventHandler );
                };
            }
        })(),
        /**
         * 触发一个事件
         * @param  {HTMLElement}  target 触发事件的dom元素
         * @param  {String}  evtType 出发的事件类型
         * @param  {event}  evt 浏览器事件对象
         * @param  {Number}  deepness 冒泡深度,0为首个直接操作元素,渐增
         * @return {[type]} 事件函数返回值,无限定类型,如果冒泡触发了多个元素事件,只返回最后一次
         */
        _fire:function(target, evtType, evt, deepness){
            var elem = target;
            var isStop = false;
            var attr = this._opt.evtAttr;
            var eventsByType = this._events[evtType];
            if(!eventsByType || !elem){
                return;
            }
            var returnValue = true;
            var ek = elem.getAttribute(attr);
            if(ek){
                var eventsByKey = eventsByType[ek];
                if(eventsByKey){
                    for(var i in eventsByKey){
                        var eItem = eventsByKey[i];
                        //有self参数的事件只响应首次事件触发
                        if(eItem.self === false || deepness === 0){
                            //执行按事件类型默认的条件检查函数
                            if(!this._checkers[evtType]|| this._checkers[evtType](evt.fromElement, evt.toElement, elem)){
                                //对于重复触发的事件，只返回最后一次的返回值
                                //dom事件多用于阻止submit提交等操作
                                if(!eItem.specialEvent ||   //非特殊事件
                                    eItem.specialEvent == 'submit' && evt.keyCode === 13){  //特殊的submit事件会被转化为keypress
                                    returnValue = eItem.handler.call(elem, evt);
                                    //执行成功了才考虑额外功能
                                    if(eItem.isStopPropagation === true){
                                        isStop = true;
                                    }
                                    if(eItem.isPreventDefault === true){
                                        evt.returnValue = false;
                                        evt.preventDefault && evt.preventDefault();
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(!isStop && elem && elem !== this._container && elem !== document.body){
                returnValue = this._fire(elem.parentNode, evtType, evt, ++deepness);
            }
            return returnValue;
        },
        /**
         * @description 绑定代理事件,在此绑定的事件,不会随着子元素消失而消失,只要存在匹配evtAttr的dom元素,就会触发
         * @method on
         * @param {String} listnerCommand  绑定代理事件的命令行, 基础语法为 evtKey:evtType/config1/config2...., 且支持以';'分割的多重事件绑定统一的函数
         *          config支持项
         *              stopPropagation 阻止继续触发父元素事件，子元素的所有冒泡均会截止至次
         *              preventDefault  阻止浏览器的默认事件
         *              self 仅响应直接触发自身的情况，不冒泡，但也不会阻止子元素的冒泡
         *
         * @param  {Function} handler      事件响应函数
         * @return {String | String[]}     删除该事件依据的参数,若listnerCommand包含多个命令,则会返回这些命令的listener的数组
         * @example
         *     var listeners =
         *     evtHelper.on('nameLabel:click/stopPropagation;phoneLabel:click', function(e){
         *
         *     });
         */
        on:function(listnerCommand, handler){
            if(listnerCommand.indexOf(';') > -1){
                var listeners = [];
                var lists = listnerCommand.split(';');
                for(var i = 0, n = lists.length; i < n; i++){
                    listeners.push(this.on(lists[i], handler));
                }
                return listeners;
            }
            //evtKey:evtType/config
            var command = listnerCommand.match(/([^:]*):([\w]*)\/?(.*)/);
            if(command.length == 0){
                throw new Error('wrong command format, must be evtKey:evtType/config1/config2....');
            }
            var evtKey = command[1];
            var evtType = command[2];
            var config = command[3];
            var specialEvent = null;
            if(evtType == 'submit'){
                evtType = 'keypress';
                specialEvent = 'submit';
            }
            var events = this._events;
            if(!events[evtType]){
                events[evtType] = {};
                this._eventsCount[evtType] = 0;
                var self = this;
                this._listeners[evtType] = this._bind(this._container, evtType, function(evt){
                    var t = self._fire(evt.target, evtType, evt, 0);
                    return t;
                });
            }
            if(!events[evtType][evtKey]){
                events[evtType][evtKey] = [];
            }
            var eID = this._getRnd();
            events[evtType][evtKey][eID] = {
                'specialEvent':specialEvent,
                'self':config.indexOf('self') > -1,
                'isStopPropagation':config.indexOf('stopPropagation') > -1,
                'isPreventDefault':config.indexOf('preventDefault') > -1,
                'handler':handler
            };
            this._eventsCount[evtType]++;
            return evtKey + ':' + evtType + '/' + eID;
        },
        /**
         * @description 移除事件监听
         * @param  {String} listnerCommand 移除事件监听的命令，支持以下几种类型
         *                  on 的返回值，用于精确移除指定的监听函数
         *                  eventKey:*   移除该eventKey下的所有类型事件监听
         *                  eventKey:eventType 移除该eventKey下的eventType的事件类型监听
         */
        off:function(listnerCommand){
            //blueText:mouseover
            //eid
            var command = listnerCommand.match(/([^:]*):([\w|*]*)\/?(.*)/);
            var evtKey = command[1];
            var evtType = command[2];
            var eID = command[3];
            //精确删除事件
            if(eID && this._events[evtType] &&
                this._events[evtType][evtKey] &&
                this._events[evtType][evtKey][eID]){
                delete this._events[evtType][evtKey][eID];
                this._eventsCount[evtType]--;
            }else if(evtType === '*'){
                //删除某个key下的所有事件类型
                for(var _evtType in this._events){
                    if(this._events[_evtType].hasOwnProperty(evtKey)){
                        delete this._events[_evtType][evtKey];
                        this._eventsCount[_evtType]--;
                    }
                }
            }else{
                //默认情况，删除指定key下的指定事件类型
                var eventsByType = this._events[evtType];
                if(eventsByType[evtKey]){
                    delete eventsByType[evtKey];
                    this._eventsCount[evtType]--;
                }
            }
            //检查每个事件类型是否还有监听
            for(var k in this._eventsCount){
                //fix bug
                //如果先绑定了click和mosueover，随后清除了click
                //过一阵再清除mouseover，就会发现click的Count=0，
                //然后就会再次尝试unbindclick，引发错误
                if(this._eventsCount[k] <= 0){
                    this._unbind(this._container, k, this._listeners[k]);
                    delete this._events[k];
                    delete this._eventsCount[evtType]
                }
            }
        },
        /**
         * @description 触发事件,不会改变this作用域，也没有冒泡的对应处理，仅仅会执行匹配的函数
         * @param  {[type]} evtKey 事件key
         * @param  {[type]} evtType 事件类型
         * @param  {[type]} args 需要传入的参数,数组形式,且真实的参数首个为null,填充event的位置,使得被执行函数可以知道是来源于trigger
         */
        trigger:function(evtKey, evtType, args){
            var eventsByType = this._events[evtType] || {};
            var eventsByKey = eventsByType[evtKey];
            if(!eventsByKey){
                return;
            }
            var returnValue = true;
            args = args || [];
            //插入null以替代event，让被trigger的函数可以明确知道自己是如何被调用的
            args.unshift(null);
            for(var i in eventsByKey){
                //对于重复触发的事件，只返回最后一次的返回值
                //dom事件多用于阻止submit提交等操作
                returnValue = eventsByKey[i].handler.apply(null, args);
            }
            return returnValue;
        },
        /**
         * 清除所有事件和监听
         */
        clear:function(){
            for(var evtType in this._listeners){
                this._unbind(this._container, evtType, this._listeners[evtType]);
                delete this._events[evtType];
                delete this._listeners[evtType];
                delete this._eventsCount[evtType];
            }
        }
    };
    namespace[NAME] = EventDelegater;
})(window);
