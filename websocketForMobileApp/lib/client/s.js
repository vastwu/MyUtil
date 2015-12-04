(function(){
    if(!window.WebSocket){
        return;
    }
    var SOCKET_URL = 'ws://10.103.16.14:{{SOCKET_PORT}}';

    var readyHandlers = [];
    window.socketImplement = {
        '$message':function(action, data, target){
            if(arguments.length == 1){
                var d = JSON.parse(action);
                return {
                    'action': d.action,
                    'data': d.data
                }
            }else{
                return JSON.stringify({
                    'action':action,
                    'data':data,
                    'target':target
                });
            }
        },
        '$send': function(action, data, target){
            socket.send(this.$message(action, data, target || '*'));
        },
        '$onReady': function(fn){
            if(readyHandlers === null){
                fn(socket);
            }else{
                readyHandlers.push(fn);
            }
        },
        '$fireReady': function(err){
            readyHandlers.forEach(function(h){
                h(err, socket);
            });
            readyHandlers = null;
        },
        'registId':function(id){
            window.$$socketId = id;
        },
        'alert': function(text){
            alert(text);
        },
        'close': function(){
            socket.close();
        },
        'boardcast':function(code){
            try{
                var result = eval(code);
                this.$send('boardcast_result', [result]);
            }catch(e){
                this.$send('boardcast_error', [e.message]);
            }
        }
    }

    var socket;
    try{
        socket = new WebSocket(SOCKET_URL);
    }catch(e){
        return;
    }
    socket.onopen = function(){
        console.log('connection ok');
        socket.onmessage = function(e){
            var msg = socketImplement.$message(e.data);
            if(socketImplement[msg.action]){
                socketImplement[msg.action].apply(socketImplement, msg.data);
            }
        }
        socketImplement.$fireReady();
    }
    socket.onerror = function(){
        socketImplement.$fireReady(1);
    }

    window.$$socket = {
        'log': function (text) {
            socketImplement.$send('boardcast_result', [text]);
        }
    };

})();
