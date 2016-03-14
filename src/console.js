/**
 * Created by shangxy on 2016/3/14.
 */
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;

const myConsole = {
    init: function(){
        ipcRenderer.on('myConsole', myConsole.log);
    },
    log: function(event, message){
        console.log(message);
    }
};

myConsole.init();