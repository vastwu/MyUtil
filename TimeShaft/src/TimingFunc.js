/**
 * 动画函数扩展库，支持数种动画曲线
 */
(function(nameSpace){
    //依赖于TimeShaft
    var A = nameSpace.Animation;
    var tween = {
        easeInQuad : function(x) {
            return Math.pow(x, 2);
        },
        easeOutQuad : function(x) {
            return -(Math.pow(( x - 1), 2) - 1);
        },
        easeInOutQuad : function(x) {
            if((x /= 0.5) < 1)
                return 0.5 * Math.pow(x, 2);
            return -0.5 * ((x -= 2) * x - 2);
        },
        easeInCubic : function(x) {
            return Math.pow(x, 3);
        },
        easeOutCubic : function(x) {
            return (Math.pow(( x - 1), 3) + 1);
        },
        easeInOutCubic : function(x) {
            if((x /= 0.5) < 1)
                return 0.5 * Math.pow(x, 3);
            return 0.5 * (Math.pow(( x - 2), 3) + 2);
        },
        easeInQuart : function(x) {
            return Math.pow(x, 4);
        },
        easeOutQuart : function(x) {
            return -(Math.pow(( x - 1), 4) - 1)
        },
        easeInOutQuart : function(x) {
            if((x /= 0.5) < 1)
                return 0.5 * Math.pow(x, 4);
            return -0.5 * ((x -= 2) * Math.pow(x, 3) - 2);
        },
        easeInQuint : function(x) {
            return Math.pow(x, 5);
        },
        easeOutQuint : function(x) {
            return (Math.pow(( x - 1), 5) + 1);
        },
        easeInOutQuint : function(x) {
            if((x /= 0.5) < 1)
                return 0.5 * Math.pow(x, 5);
            return 0.5 * (Math.pow(( x - 2), 5) + 2);
        },
        easeInSine : function(x) {
            return -Math.cos(x * (Math.PI / 2)) + 1;
        },
        easeOutSine : function(x) {
            return Math.sin(x * (Math.PI / 2));
        },
        easeInOutSine : function(x) {
            return (-.5 * (Math.cos(Math.PI * x) - 1));
        },
        easeInExpo : function(x) {
            return (x == 0) ? 0 : Math.pow(2, 10 * ( x - 1));
        },
        easeOutExpo : function(x) {
            return (x == 1) ? 1 : -Math.pow(2, -10 * x) + 1;
        },
        easeInOutExpo : function(x) {
            if(x == 0)
                return 0;
            if(x == 1)
                return 1;
            if((x /= 0.5) < 1)
                return 0.5 * Math.pow(2, 10 * ( x - 1));
            return 0.5 * (-Math.pow(2, -10 * --x) + 2);
        },
        easeInCirc : function(x) {
            return -(Math.sqrt(1 - (x * x)) - 1);
        },
        easeOutCirc : function(x) {
            return Math.sqrt(1 -  Math.pow(( x - 1), 2))
        },
        easeInOutCirc : function(x) {
            if((x /= 0.5) < 1)
                return -0.5 * (Math.sqrt(1 - x * x) - 1);
            return 0.5 * (Math.sqrt(1 - (x -= 2) * x) + 1);
        },
        //弹性
        easeOutBounce : function(x) {
            if((x) < (1 / 2.75)) {
                return (7.5625 * x * x);
            } else if(x < (2 / 2.75)) {
                return (7.5625 * (x -= (1.5 / 2.75)) * x + .75);
            } else if(x < (2.5 / 2.75)) {
                return (7.5625 * (x -= (2.25 / 2.75)) * x + .9375);
            } else {
                return (7.5625 * (x -= (2.625 / 2.75)) * x + .984375);
            }
        },
        easeInBack : function(x) {
            var s = 1.70158;
            return (x) * x * ((s + 1) * x - s);
        },
        easeOutBack : function(x) {
            var s = 1.70158;
            return ( x = x - 1) * x * ((s + 1) * x + s) + 1;
        },
        easeInOutBack : function(x) {
            var s = 1.70158;
            if((x /= 0.5) < 1)
                return 0.5 * (x * x * (((s *= (1.525)) + 1) * x - s));
            return 0.5 * ((x -= 2) * x * (((s *= (1.525)) + 1) * x + s) + 2);
        },
        elastic : function(x) {
            return -1 * Math.pow(4, -8 * x) * Math.sin((x * 6 - 1) * (2 * Math.PI) / 2) + 1;
        },
        swingFromTo : function(x) {
            var s = 1.70158;
            return ((x /= 0.5) < 1) ? 0.5 * (x * x * (((s *= (1.525)) + 1) * x - s)) : 0.5 * ((x -= 2) * x * (((s *= (1.525)) + 1) * x + s) + 2);
        },
        swingFrom : function(x) {
            var s = 1.70158;
            return x * x * ((s + 1) * x - s);
        },
        swingTo : function(x) {
            var s = 1.70158;
            return (x -= 1) * x * ((s + 1) * x + s) + 1;
        },
        bounce : function(x) {
            if(x < (1 / 2.75)) {
                return (7.5625 * x * x);
            } else if(x < (2 / 2.75)) {
                return (7.5625 * (x -= (1.5 / 2.75)) * x + .75);
            } else if(x < (2.5 / 2.75)) {
                return (7.5625 * (x -= (2.25 / 2.75)) * x + .9375);
            } else {
                return (7.5625 * (x -= (2.625 / 2.75)) * x + .984375); 
            }
        },
        bouncePast : function(x) {
            if(x < (1 / 2.75)) {
                return (7.5625 * x * x);
            } else if(x < (2 / 2.75)) {
                return 2 - (7.5625 * (x -= (1.5 / 2.75)) * x + .75);
            } else if(x < (2.5 / 2.75)) {
                return 2 - (7.5625 * (x -= (2.25 / 2.75)) * x + .9375);
            } else {
                return 2 - (7.5625 * (x -= (2.625 / 2.75)) * x + .984375);
            }
        },
        easeFromTo : function(x) {
            if((x /= 0.5) < 1)
                return 0.5 * Math.pow(x, 4);
            return -0.5 * ((x -= 2) * Math.pow(x, 3) - 2);
        },
        easeFrom : function(x) {
            return Math.pow(x, 4);
        },
        easeTo : function(x) {
            return Math.pow(x, 0.25);
        },
        linear : function(x) {
            return x
        },
        sinusoidal : function(x) {
            return (-Math.cos(x * Math.PI) / 2) + 0.5;
        },
        reverse : function(x) {
            return 1 - x;
        },
        mirror : function(x, transition) {
            transition = transition || tween.sinusoidal;
            if(x < 0.5)
                return transition(x * 2);
            else
                return transition(1 - ( x - 0.5) * 2);
        },
        flicker : function(x) {
            var x = x + (Math.random() - 0.5) / 5;
            return tween.sinusoidal(x < 0 ? 0 : x > 1 ? 1 : x);
        },
        wobble : function(x) {
            return (-Math.cos(x * Math.PI * (9 * x)) / 2) + 0.5;
        },
        pulse : function(x, pulses) {
            return (-Math.cos((x * ((pulses || 5) - .5) * 2) * Math.PI) / 2) + .5;
        },
        blink : function(x, blinks) {
            return Math.round(x * (blinks || 5)) % 2;
        },
        spring : function(x) {
            return 1 - (Math.cos(x * 4.5 * Math.PI) * Math.exp(-x * 6));
        },
        none : function(x) {
            return 0;
        }
    };
    for(var k in tween){
        A.extend(k, tween[k]);
    }

}(window));