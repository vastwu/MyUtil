define(function(require, exports, beta){
    var camelCache = {},
        reg = /-(\w)/g,
        replacehandler = function(fit, after, n){
            //首个-不转大写
            return n == 0 ? after : after.toUpperCase();         
        };
    //-webkit-abc-def 转驼峰  webkitAbcDef
    function toCamel(str){
        if(camelCache[str]){
            return camelCache[str];
        }
        var camel = str.replace(reg, replacehandler);
        camelCache[str] = camel;
        return camel;
    };
    var CssAnimHelper = function(elem){
        this.animCss = {
            'name':'undefined',
            'iteration-count':'1',
            'duration':'1s',
            'delay':'0',
            'direction':'normal',
            'fill-mode':'none',
            'timing-function':'linear'
        };
    };
    CssAnimHelper.prototype.set = function(key, value){
        this.animCss[key] = value;
    };
    CssAnimHelper.prototype.update = function(elem){
        var attrName;
        for(var k in this.animCss){
            attrName = toCamel('-webkit-animation-' + k);
            elem.style[attrName] = this.animCss[k];
        }
        elem = null;
    };
    CssAnimHelper.prototype.setPlayState = function(elem, state){
        elem.style[toCamel('-webkit-animation-play-state')] = state;
    };
    CssAnimHelper.prototype.FILL_MODE = {
        'none':'none',
        'forwards':'forwards',
        'backwards':'backwards',
        'both':'both'
    };
    CssAnimHelper.prototype.TIMING_FUNCTION = {
        'linear':'linear',
        'ease':'ease',
        'easeIn':'ease-in',
        'easeOut':'ease-out',
        'easeInOut':'ease-in-out',
        'cubicBezier':function(a, b, c, d){
            return 'cubic-bezier(' + a + ',' + b + ',' + c + ',' + d + ')';
        }
    };
    CssAnimHelper.prototype.PLAY_STATE = {
        'running':'running',
        'paused':'paused'
    };
    return CssAnimHelper;
});