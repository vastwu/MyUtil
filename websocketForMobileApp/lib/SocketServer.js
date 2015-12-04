var PORT = 8888

var WebSocketServer = require('ws').Server;
var wServer = new WebSocketServer({
    'port':PORT
}, function(){
    console.log('websocket listen on ', PORT);
});


var Message = function(action, data){
    if(arguments.length == 1){
        var d = JSON.parse(action);
        return d;
    }else{
        return JSON.stringify({
            'action':action,
            'data':data
        });
    }
}

var updateConnectionList = function(){
    var list = wServer.clients.map(function(c){
        return c.$socketId;
    });
    wServer.clients.forEach(function(client){
        if(client.$socketId === 'master'){
            client.send(Message('updateConnectionList', [list]));
        }
    });
}
var sendToMaster = function(action, data){
    wServer.clients.forEach(function(client){
        if(client.$socketId === 'master'){
            client.send(Message(action, data));
        }
    });
}

var socketId = 1;
wServer.on('connection', function(ws){
    socketId++;
    ws.$socketId = socketId;
    ws.send(Message('registId', [socketId]));
    console.log('some one connection', wServer.clients.length);
    sendToMaster('boardcast_success', ['connection', ws.$socketId]);
    updateConnectionList();
    ws.on('close', function(){
        console.log('some one lost connection');
        sendToMaster('boardcast_warning', ['lost', ws.$socketId]);
        updateConnectionList();
    });

    ws.on('message', function(message){
        var msg = Message(message);
        console.log('message:', msg);
        switch(msg.action){
            case 'setMaster':
                console.log('master online');
                ws.$socketId = 'master';
                updateConnectionList();
                break;
            case 'boardcast':
                wServer.clients.forEach(function(client){
                    if(client !== ws && (msg.target === '*' || msg.target == client.$socketId)){
                        console.log('send to:', client.$socketId);
                        client.send(Message(msg.action, msg.data));
                    }
                });
                break;
            case 'boardcast_result':
            case 'boardcast_error':
                msg.data.push(ws.$socketId);
                /*
                wServer.clients.forEach(function(client){
                    if(client.$socketId === 'master'){
                        client.send(Message(msg.action, msg.data));
                    }
                });
                */
                sendToMaster(msg.action, msg.data);
        }
    })
});

