var fork = require('child_process').fork;
var url = require('url');
var fs = require('fs');
var http = require('http');
var PORT = process.env.PORT || 3090
/*
var childProcess = fork(__dirname + '/SocketServer.js');

setTimeout(function(){
    childProcess.kill();
}, 2000)
*/
var childProcess = null;
var SOCKET_PORT = 8888

var server = http.createServer(function(req, res){
    var query = url.parse(req.url, true).query;
    var message = 'error qt';
    console.log('http request', query, req.url);
    if (query.qt) {
      // service
      if(query.qt === 'start'){
          if(childProcess !== null){
              message = 'server is running';
          }else{
              message = 'start finish';
              childProcess = fork(__dirname + '/SocketServer.js');
              childProcess.on('close', function(){
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
    } else {
      //static
      var filePath = __dirname + '/client' + req.url;
      if (req.url === '/s' || req.url === '/s.js') {
        content = fs.readFileSync(__dirname + '/client/s.js', 'utf-8');
        content = content.replace('{{SOCKET_PORT}}', SOCKET_PORT);
        res.statusCode = 200;
        res.end(content);
      } else if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf-8');
        res.statusCode = 200;
        res.end(content);
      } else {
        console.log('notexist');
        res.statusCode = 404;
        res.end(filePath);
      }
    }
}).listen(PORT, function(){
    console.log('listen ' + PORT);
});
