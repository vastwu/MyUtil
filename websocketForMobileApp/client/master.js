(function(){
    ace.require("ace/ext/language_tools");
    var editor = ace.edit("code");
    editor.session.setMode("ace/mode/javascript");
    editor.setTheme("ace/theme/monokai");
    // enable autocompletion and snippets
    editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
    });
    editor.setAutoScrollEditorIntoView(true);
    editor.setOption("maxLines", 300);
    editor.setOption("minLines", 100);


    window.aceEditor = editor;
})();
socketImplement.$onReady(function(err, socket){

    var $ = function(q){ return document.querySelector(q)};

    var SERVER_OPERATE_DOMAIN = 'http://st01-lbs-st-env-fe-dev.st01.baidu.com';

    var startServer = function(cb){
        var s = document.createElement('script');
        s.src = SERVER_OPERATE_DOMAIN + ':8555/?qt=start&cb=window.$$startFinish';
        window.$$startFinish = cb;
        document.body.appendChild(s);
    }
    var stopServer = function(cb){
        var s = document.createElement('script');
        s.src = SERVER_OPERATE_DOMAIN + ':8555/?qt=stop&cb=window.$$stopFinish';
        window.$$stopFinish = cb;
        document.body.appendChild(s);
    }

    if(err){
        $('#startServer').style.display = '';
        $('#startServer').addEventListener('click', function(){
            //socket未启动,需要启动服务
            startServer(function(message){
                alert(message);
                location.reload();
            });
        })
    }else{
        socketImplement.$send('setMaster');
        $('#stopServer').style.display = '';
        $('#stopServer').addEventListener('click', function(){
            stopServer(function(message){
                alert(message);
                location.reload();
            });
        });
    }


    var print = {
        _output:function(from, text, type){
            var t = new Date().toLocaleTimeString();
            var div = document.createElement('div'); 
            div.className = 'item ' + (type || '');
            div.innerHTML = '<span class="from">[' + t + '][sockedID:' + from + ']</span><span>' + text + '</span>';
            var $logs = $('#logs');
            if($logs.firstChild){
                $logs.insertBefore(div, $logs.firstChild); 
            }else{
                $logs.appendChild(div);
            }
        },
        log:function(from, text){
            this._output(from, text); 
        },
        error:function(from, text){
            this._output(from, text, 'error'); 
        },
        success:function(from, text){
            this._output(from, text, 'success'); 
        },
        warning:function(from, text){
            this._output(from, text, 'warning'); 
        }
    }

    $('#submit').addEventListener('click', function(){
        //var code = $('#code').value.trim();
        var code = window.aceEditor.getValue();
        var target = $('#targetList').value;
        socketImplement.$send('boardcast', [code], target || '*');
    });
    $('#clear').addEventListener('click', function(){
        $('#logs').innerHTML = '';
    });
    $('#help').addEventListener('click', function(){
        $('#help-container').style.display = 'block';
    });
    $('#help-container').addEventListener('click', function(e){
        if(e.target === this){
            $('#help-container').style.display = 'none';
        }
    });
    socketImplement.boardcast_success = function(text, from){
        print.success(from, text); 
    }
    socketImplement.boardcast_result = function(result, from){
        print.log(from, result); 
    }
    socketImplement.boardcast_warning = function(error, from){
        print.warning(from, error); 
    }
    socketImplement.boardcast_error = function(error, from){
        print.error(from, error); 
    }
    socketImplement.updateConnectionList = function(list){
        list.push('*');
        var listContainer = $('#targetList');
        var selectedValue = +listContainer.value;
        listContainer.innerHTML = list.map(function(id, i){
            if(id === 'master'){
                return ''; 
            }else{
                // keep select value
                if(id === selectedValue){
                    return '<option value="' + id + '" selected>' + id + '</options>'; 
                }else{
                    return '<option value="' + id + '">' + id + '</options>'; 
                }
            }
        }).join('');
    }
});
