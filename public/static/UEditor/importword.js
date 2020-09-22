UE.registerUI('importword',function(editor,uiName){
  var dialog = new UE.ui.Dialog({
    iframeUrl: editor.options.UEDITOR_HOME_URL+'dialogs/importword/importWordPage.html',
    cssRules:"width:"+ parseInt(document.body.clientWidth*0.2) +"px;height:"+(window.innerHeight -700)+"px;",
    editor:editor,
    name:uiName,
    title:"Word导入"
  });
  dialog.fullscreen = false;
  dialog.draggable = false;
  var btn = new UE.ui.Button({
    name:'btn-dialog-' + uiName,
    className:'importword',
    title:'Word导入',
    onclick:function () {
      dialog.render();
      dialog.open();
    }
  });
  return btn;
},undefined);
// 修改最后的undefined参数为数字序号，比如5，可调整135编辑器按钮的顺序。默认出现在最后面
