EventDelegater
===========

有什么功能?
-----------
帮助完成dom事件代理,其实这功能jQuery也可以实现,做这个就是为了更轻量化了一些,功能更单一


如何使用?
-----------
有这样一组dom结构
```html
	<div id="parentElement">
		<div ek="aclick">1</div>
		<div ek="belem">1</div>
		<div ek="cclick">1</div>
	</div>
```
js部分
```javascript

	//实例化一个EventHelp对象
	var evtHelper = new EventDelegater(parentElement, {
		evtAttr:'ek'	//默认的也是ek,触发事件所依据的dom节点属性名
	});
	//这样绑定事件
    var a_click = evtHelper.on('aclick:click', function(evt){
        alert('a is click');
    });
    var b_click = evtHelper.on('belem:click', function(evt){
        alert('b is click');
    });
    var b_over = evtHelper.on('belem:mouseover', function(evt){
        alert('b is mouseover');
    });
	//这样移除事件
    evtHelper.off('aclick:click');
	//这样移除事件
    evtHelper.off('belem:*');
    //或者
    evtHelper.off(b_click);
    //甚至
    evtHelper.clear();
```

特点:
---------
* 每一种事件(click/mouseover/...)只会在父容器dom节点中绑定一个,子元素不携带任何事件
* 当需要移除子节点时,不用担心内存泄漏
* 可以动态添加子节点,只要有对应的evtAttr,无需重新绑定事件
* 当一组容器内的同类事件不存在/被全部移除/调用clear(),父容器的事件也会被清理,即可移除父容器节点
