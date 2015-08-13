;(function(nameSpace){
    //依赖于TimeShaft
    var TS = nameSpace.TimeShaft,
        EMPTY = function(){},
        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,
        STATUS = {
            WAITING:1,
            PLAYING:2,
            PAUSE:3,
            FINISH:4
        },
        PLAY_METHOD = {
            //线性函数
            linear:function(x){
                return x;
            },
            //加速函数
            easeIn:function(x){
                return Math.pow(x, 2);
            },
            //减速函数
            easeOut:function(x){
                return Math.pow(x, 0.5);
            }
        };
    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }
    /**
     * [Animation description]
     * @param {Object} options  [参数配置项] 该参数可以省略，则首个参数被认为是playFunc
     * @param {Number} [options.begin=0] 起始值 
     * @param {Number} [options.end=100] 终止值 
     * @param {Number} [options.duration=1000] 持续时间 
     * @param {Number} [options.times=1] 重复次数 
     * @param {Function|Animation.TIMING_FUNCTION}
     *        [options.timingFunction=Animation.TIMING_FUNCTION.LINEAR] 变化方程，默认线性
     * @param {Function} [options.onBegin=EMPTY] 开始播放前执行
     * @param {Function} [options.onEnd=EMPTY] 结束播放后执行
     * @param {Number} [options.FPS=maxFps] 实际运行帧率，[0, maxFps]，上限取决于时间轴的最大帧率
     * @param {Number} [options.getFPS=false] 是否计算fps，会一定程度上拖累性能
     * @param {Function} playFunc 动画执行体
     */
    var Animation = function(options, playFunc){
        if(arguments.length == 1 && isFunction(options)){
            playFunc = options;
            options = undefined;
        }
        options = options || {};
        this.playFunc = playFunc;
        this.playID = null;
        //播放进度, [0,1]
        this.progress = 0;
        //当前帧数
        this.FPS = 0;
        //计算当前fps的积累值
        this._fpss = {n:0,startTime:0};
        //当前状态
        this.status = STATUS.WAITING;
        this.options = {
            'begin':options.begin !== undefined ? options.begin : 0,
            'end':options.end !== undefined ? options.end : 100,
            'duration':options.duration || 1000,
            'times':options.times || 1,
            'timingFunction':options.timingFunction || PLAY_METHOD.linear,
            'onBegin':options.onBegin || EMPTY,
            'onEnd':options.onEnd || EMPTY,
            'FPS':options.FPS || undefined
        };
    };
    Animation.extend = function(id, func){
        this.TIMING_FUNCTION[id] = func;
    };
    Animation.TIMING_FUNCTION = PLAY_METHOD;
    var Ap = Animation.prototype;
    Ap.play = function(){
        if(this.playID && this.status !== STATUS.PAUSE){
            this.stop();
        }
        var self = this;
        var opt = this.options;     
        //如果是由pause->play的过程,之前的进度会保存下来
        var pausedProgress = this.progress;  
        //总的变化量
        var d = opt.end - opt.begin;
        opt.onBegin(opt.begin);
        var maxDuration = self.options.duration;
        this.status = STATUS.PLAYING;
        this.playID = TS.add(null, function(passTime, prevTime){
            var progress = pausedProgress + passTime / maxDuration; 
            if(progress < 1){
                self.progress = progress;
                var toValue = opt.begin + d * opt.timingFunction(progress);
                self.playFunc(toValue);
            }else{
                if(opt.times === Infinity || --opt.times > 0){
                    //next time
                    self.progress = 0;
                    self.play();
                }else{
                    //end
                    self.stop();
                    return true;
                }
            }
        }, opt.FPS);
    };
    /**
     * 增加动画次数
     * @param {Number} n 需要增加的次数
     */
    Ap.addTimes = function(n){
        this.options.times += n;
    },
    /**
     * 结束动画,直接执行最后一帧,并执行 onEnd
     * @return {[type]} [description]
     */
    Ap.stop = function(){
        this.progress = 0;
        TS.remove(this.playID);
        this.playFunc(this.options.end);
        this.options.onEnd();
        this.playID = null;
        this.FPS = 0;
        this.status = STATUS.FINISH;
    };
    /**
     * 暂停动画，可以使用 play()继续播放
     * @return {[type]} [description]
     */
    Ap.pause = function(){
        this.status = STATUS.PAUSE;
        TS.remove(this.playID);
    };
    /**
     * 获取播放过程中的真实帧数,若动画未开始,暂停或结束,则帧数为 0
     * @return {[type]} [description]
     */
    Ap.getFPS = function(){
        return TS.getFPS().toFixed(1);
    };
    /**
     * 获取播放进度
     * @return {Number} 返回当前播放进度, 0 - 1 之间的浮点数
     */
    Ap.getProgress = function(){
        return this.progress;
    };
    /**
     * 获取剩余未开始的次数
     * @return {Number} 未开始的次数,如果只播放一次且在播放中,该接口返回 0
     */
    Ap.getLeftTimes = function(){
        return this.options.times;
    };
    var NAME = 'Animation';
    nameSpace[NAME] = Animation;
}(window));