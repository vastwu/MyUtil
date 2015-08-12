var fork = require('child_process').fork;
var url = require('url');
var http = require('http');

/*
var childProcess = fork(__dirname + '/SocketServer.js');

setTimeout(function(){
    childProcess.kill();
}, 2000)
*/
var childProcess = null;

var server = http.createServer(function(req, res){
    var query = url.parse(req.url, true).query;
    var message = 'error qt';
    console.log('http request', query);
    if(query.qt === 'start'){
        if(childProcess !== null){
            message = 'server is running';
        }else{
            message = 'start finish';
            childProcess = fork(__dirname + '/SocketServer.js');
            childProcess.addEventListener('close', function(){
                childProcess = null; 
            });
        }
    }else if(query.qt === 'stop'){
        if(childProcess !== null){
            message = 'stop finish';
            childProcess.kill();
            childProcess = null;
        }else{
            message = 'no server running';
        }
    }
    res.end(query.cb + "('" + message + "');");  
}).listen('8555', function(){
    console.log('listen 8555');
});
