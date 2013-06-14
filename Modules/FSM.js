define(function(require, exports, beta){
    var EventProrotype = require('EventProrotype');

    var FSMState = function(name, option){
        this.name = name;
        if(option.onEntry){
            this.on('entry', option.onEntry);
        }
        if(option.onExit){
            this.on('exit', option.onExit);
        }
        if(option.actions){
            for(var k in option.actions){
                this.on(k, option.actions[k]);
            } 
        }
        
    };
    FSMState.prototype = EventProrotype;
    FSMState.prototype.getName = function(){
        return this.name;
    };


    var FSM = function(transformMap){
        this.transformMap = transformMap;
        this.states = {};
        this.currectState = null;
    };
    FSM.prototype = EventProrotype;
    FSM.prototype.append = function(name, option, setCurrectState){
        var s = new FSMState(name, option);
        this.states[name] = s;
        if(setCurrectState || !this.currectState){
            this.currectState = s;
        }
        return this;
    };
    FSM.prototype.action = function(actionName){
        var name = this.currectState.getName();
        if(this.transformMap[name] && this.transformMap[name][actionName]){
            var fromState = this.currectState;
            var toState = this.states[this.transformMap[name][actionName]];
            fromState.fire(actionName);
            fromState.fire('exit');            
            toState.fire('entry');
            this.fire('stateChanged', [fromState, toState]);
            this.currectState = toState;
        }
        return this;
    };
    return FSM;
});