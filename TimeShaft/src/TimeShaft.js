;(function(nameSpace){
    var n = "0",
        handlers = {},
        MAX_FPS = 60,   //最高帧数
        count = 0,      //时间轴内的监听函数个数
        runner = null,  //轮询函数
        avageFps = MAX_FPS,
        countFps = 0,
        fpsCounterTime = 0,
        errorKey = undefined,
        getNow = Date.now ? function(){
                return Date.now();
            }:function(){
                return new Date().getTime();
            };
    var TimeShaft = {
        init:function(){
            fpsCounterTime = getNow();
            runner = window.setInterval(function(){
                TimeShaft.run(getNow());
            }, 1000 / MAX_FPS);
        },
        run:function(thisTime){
            var h, id;
            for(id in handlers){
                h = handlers[id];
                if(errorKey){
                    TimeShaft.remove(errorKey);
                    if(errorKey == id){
                        return;
                    }
                }
                //非默认帧数,且之前已经运行过了，此处要计算当前帧是否需要运行
                //若还没有运行过，则执行第一帧
                if(h.FPS && h.prevRunTime){
                    //当前时间与上次运行时间小每帧间隔 不运行
                    if(thisTime - h.prevRunTime <= h.interFrame){
                        return;
                    }
                }
                //如果handler顺利运行结束，则errorkey会是undefined，否则会记录下出错的函数
                //在下一帧会移除该函数
                errorKey = id;
                if(h.handler(thisTime - h.startTime, h.prevRunTime, thisTime) === true){
                    TimeShaft.remove(id);
                }
                errorKey = undefined;
                //记录每个函数的当前帧的运行时间，用于和下一帧作比较
                h.prevRunTime = thisTime;
            };
            //如果当前帧数计数器 已经大于 最大跳帧设置, 重置
            //时间轴内的监听函数个数
            if(count == 0){
                window.clearInterval(runner);
                runner = null;
            }
            //计算40帧内的平均帧率
            countFps++;
            if(countFps >= 10){
                // 1000 / duration / 10 
                avageFps = 1000 / ((thisTime - fpsCounterTime ) / 10);
                countFps = 0;
                fpsCounterTime = thisTime;
            }
        },
        /**
         * 将一个函数加入时间轴控制，每一帧执行一次，
         * @param {String} [id]      同id会互相覆盖，该参数可以忽略，则会随机生成
         * @param {Function} handler 执行的函数，每帧执行一次，若该函数返回true，则执行结束后立刻移出时间轴
         *                         handler(duration) handler运行时接受两个参数，
         *                              startTime 从开始时间到执行时刻的经过时间，
         *                              prevRunTime 上一次运行到当前的运行时间
         * @param {Number} [FPS=undefined] 实际帧率，允许以小于最大帧率的帧率运行
         */
        add:function(id, handler, FPS){ 
            if(arguments.length == 1){
                handler = id;
                id = undefined;
            }        
            id = id || "R_" + new Date().getTime().toString(32) + (++n);
            if(count == 0 && runner === null){
                this.init();
            }
            var h = handlers[id];
            if(h){
                delete handlers[id];
            }else{
                count++;
            }
            h = {
                startTime:getNow(),
                handler:handler,
                FPS:(FPS && FPS < MAX_FPS) ? FPS : undefined,
                prevRunTime:0
            };            
            if(h.FPS){
                //预计算每帧间隔时间
                h.interFrame = 1000 / h.FPS;
            }
            handlers[id] = h;
            return id;
        },
        remove:function(id){
            if(handlers[id]){
                delete handlers[id];
                count--;
            }
        },
        getFPS:function(){
           return Math.min(avageFps, MAX_FPS);
        },
        setMaxFPS:function(n){
            MAX_FPS = n;
        }
    };


    var NAME = 'TimeShaft';
    nameSpace[NAME] = TimeShaft;
}(window))

