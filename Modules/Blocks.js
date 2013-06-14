
define(function(require, exports, beta){
    var clone = function(elem){
        var result;
        if(elem.constructor == Array){
            result = [];
            for(var i = 0, n = elem.length; i < n; i++){
                result.push(clone(elem[i]));
            }
        }else if(elem.constructor == Object){
            result = {};
            for(var k in elem){
                result[k] = clone(elem[k]);
            }
        }else{
            result = elem;
        }
        return result;
    };

    var EventProrotype = require('EventProrotype');
    /**
     * make children element be flex, auto position
     * @param {HTMLElement} containerElem parentNode
     * @param {Object} option  config for flex
     * @config {String} tag children's tagName
     * @config  {String} padding elemnts padding of container, support format like css
     *                          padding:'x'       top=right=bottom=left=x
     *                          padding:'x y'     top=bottom=x, left=right=y
     *                          padding:'x y z'   top=x, left=right=y bottom=z
     *                          padding:'x y k'   top=x, right=y bottom=z left=k
     * @config  {String} margin elemnts margin of others  format as padding
     */
    var getSize = function(elem){
        return {
            w:elem.clientWidth,
            h:elem.clientHeight
        };
    };
    //获取边距
    var getPM = function(s){
        if(!s){
            return;
        }
        var s = s.toString().split(' ');
        var n = s.length;
        switch (n){
            case 1:
                return [s[0]*1,s[0]*1,s[0]*1,s[0]*1];
            case 2:
                return [s[0]*1,s[1]*1,s[0]*1,s[1]*1];
            case 3:
                return [s[0]*1,s[1]*1,s[2]*1,s[1]*1];
            case 4:
                return [s[0]*1,s[1]*1,s[3]*1,s[4]*1];
            default:
                return null;
        }
    };
    var FlexBox = function(containerElem, option){
        option = option || {};

        var _cs = containerElem.getElementsByTagName(option.tag || 'div');
        var cs =[];
        for(var i = 0, n = _cs.length; i < n; i++){
            cs.push(_cs[i]);
        }
        cs.sort(function(a, b){
            return a.getAttribute('i') * 1 > b.getAttribute('i') * 1 ? 1 : -1;
        });
        //top right bottom left
        var PADDING = option.padding;
        var MARGIN = option.margin;
        var elem;
        //container size
        var MAX_WIDTH = containerElem.clientWidth;
        var fn = {
            w:0,
            h:0
        };
        var thisSize;
        var left = PADDING[3], top = PADDING[0];
        var size = {};
        var dataList = [];
        for(var i = 0, n = cs.length; i < n; i++){
            elem = cs[i];
            elem.style.position = 'absolute';
            thisSize = getSize(elem);
            // left = i == 0 ? PADDING[3] + MARGIN[3] : left + fn.w + MARGIN[1] + MARGIN[3];
            // if(MAX_WIDTH - left  < thisSize.w + MARGIN[1] + MARGIN[3] + PADDING[1]){
            //     //not enough space, enter line
            //     top = top + fn.h + MARGIN[0] + MARGIN[2] + MARGIN[0];
            //     left = PADDING[3] + MARGIN[3];          
            // }
            left = i == 0 ? left : left + fn.w + MARGIN[1] + MARGIN[3];
            if(MAX_WIDTH - left  < thisSize.w + MARGIN[3] + PADDING[1]){
                //not enough space, enter line
                top = top + fn.h + MARGIN[0] + MARGIN[2];
                left = PADDING[3];          
            }
            // elem.style.top = top + 'px';
            // elem.style.left = left + 'px';
            dataList.push({
                'base':{
                    'left':left,
                    'top':top,
                    'width':thisSize.w,
                    'height':thisSize.h
                },
                'left':left,
                'top':top,
                'width':thisSize.w,
                'height':thisSize.h,
                'changed':true
            });
            //elem.clientWidth
            fn = thisSize;
        }
        // containerElem.style.height = top + fn.h + PADDING[3] + 'px';
        return dataList;
    };
    var Block = function(container, opt){
        this.flexOpt =  opt || {};
        this.flexOpt.margin = getPM(this.flexOpt.margin);
        this.flexOpt.padding = getPM(this.flexOpt.padding);
        this.container = container;
        this.dataList = FlexBox(container, this.flexOpt);
        this.baseDataList = clone(this.dataList);
        this.showIndex = -1;
        this.draw();
        var self = this;
        container.addEventListener('click', function(e){
            var t = e.target;
            var size = getSize(t);
            var index = t.getAttribute('i');
            if(index == null){
                return;
            }
            if(self.showIndex == index){
                self.showIndex = -1;
                self.revertModel();
                self.draw();   
                return;
            }
            if(self.showIndex !== -1){
                self.revertModel();
            }
            var diff = {
                'left':size.w + self.flexOpt.margin[1] + self.flexOpt.margin[3],
                'top':size.h + self.flexOpt.margin[0] + self.flexOpt.margin[2]
            };
            self.showIndex = index;
            self.updateModel(index, diff); 
            self.draw();          
        })
    };
    Block.prototype = EventProrotype;
    Block.prototype.revertModel = function(){
        this.dataList = clone(this.baseDataList);
    };
    Block.prototype.draw = function(){
        var doms = this.container.getElementsByTagName(this.flexOpt.tag);
        this.dataList.forEach(function(elem, index){
            if(elem.changed == true){
                var dom = doms[index];
                dom.style.width = elem.width + 'px';
                dom.style.height = elem.height + 'px';
                dom.style.left = elem.left + 'px';
                dom.style.top = elem.top + 'px';
                elem.changed = false;
            }
        });
        var last = this.dataList[this.dataList.length - 1];
        this.container.style.height = last.top + last.height + this.flexOpt.padding[3] + 'px';
    };
    Block.prototype.updateModel = function(clickIndex, diff){        
        var n = clickIndex % 3;
        clickIndex = clickIndex * 1;
        if(n == 0){
            this.dataList = this.dataList.map(function(elem, index, arr){
                if(index == clickIndex){
                    elem.width = elem.base.width + diff.left;
                    elem.height = elem.base.height + diff.top;
                    elem.changed = true;
                }else if(index == clickIndex + 1){
                    elem.left = elem.base.left + diff.left;
                    elem.changed = true;
                }else if(index >= clickIndex + 2){
                    elem.top = elem.base.top + diff.top;
                    elem.changed = true;
                }
                return elem;
            });
        }else if(n == 1){
            this.dataList = this.dataList.map(function(elem, index, arr){
                if(index == clickIndex){
                    elem.width = elem.base.width + diff.left;
                    elem.height = elem.base.height + diff.top;
                    elem.changed = true;
                }else if(index == clickIndex + 1){
                    elem.left = elem.base.left - diff.left * 2;
                    elem.top = elem.base.top + diff.top;
                    elem.changed = true;
                }else if(index > clickIndex + 1){
                    elem.top = elem.base.top + diff.top;
                    elem.changed = true;
                }
                return elem;
            });
        }else if(n == 2){
            this.dataList = this.dataList.map(function(elem, index, arr){
                if(index == clickIndex){
                    elem.left = elem.base.left - diff.left;
                    elem.width = elem.base.width + diff.left;
                    elem.height = elem.base.height + diff.top;
                    elem.changed = true;
                }else if(index == clickIndex -2){
                    // elem.left = elem.base.left - diff.left * 2;
                    // elem.top = elem.base.top + diff.top;
                    // elem.changed = true;
                }else if(index == clickIndex -1){
                    elem.left = elem.base.left - diff.left;
                    elem.top = elem.base.top + diff.top;
                    elem.changed = true;
                }else if(index >= clickIndex + 1){
                    elem.top = elem.base.top + diff.top;
                    elem.changed = true;
                }
                return elem;
            });
        }
    };
    return Block;
});