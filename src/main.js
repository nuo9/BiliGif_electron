/**
 * Created by shangxy on 2016/3/14.
 */
'use strict';

const electron = require('electron');
const fs = require('fs');
const browserWindow = electron.BrowserWindow;
const app = electron.app;

let mainBrowserWindow;
let mainWebContents;
let mainSession;

let json_path = './download/json/';
let gifs_path = './download/gifs/';
let json;

let gif_size = {
    width: 76,
    height: 44
};
let random_size = {};

let window_config = {width: gif_size.width, height: gif_size.height, resizable: false, moveable: false, minisizeable: false, maxsizeable: false, closeable: false, fullscreenable: false, skipTaskbar:true, title:'gif', icon: null, frame: false, autoHideMenuBar:true, backgroundColor:'#FFF', hasShadow: false};

const main = {
    ready: function(){
        main.initWindow();
    },
    log: function(message){
        mainWebContents.send('myConsole', 'From Main Process: ' + message);
    },
    initWindow: function(){
        // TODO 控制台外观
        mainBrowserWindow = new browserWindow({show: false});
        mainWebContents = mainBrowserWindow.webContents;
        // TODO options
        mainWebContents.openDevTools({});
        mainSession = mainWebContents.session;
        mainWebContents.on('did-finish-load', function(){
            main.log('Did Finish Load!');
            setTimeout(main.downloadJson, 100);
        });
        mainWebContents.loadURL('file://' + __dirname + '/console.html');
    },
    downloadJson: function(){
        mainSession.on('will-download', function(event, item, webContents) {
            var fileName = item.getFilename();
            if(fileName.indexOf('json') == -1){
                return;
            }
            item.setSavePath(json_path + fileName);
            item.on('done', function(e, state) {
                if (state == 'completed') {
                    main.log('Json Get! ( ^_^ )');
                    setTimeout(main.readJson, 100);
                } else {
                    main.log('Json Get Failed!');
                }
            });
        });
        mainWebContents.downloadURL('http://www.bilibili.com/index/index-icon.json');
    },
    readJson: function(){
        fs.readFile(json_path + 'index-icon.json', function(err, data){
            if(!err){
                json = JSON.parse(data).fix;
                //setTimeout(main.showGifs, 100);
                setTimeout(main.saveGifs, 100);
            }else{
                main.log('read error, path: ' + json_path);
            }
        });
    },
    showGifs: function(){
        var screen_size = electron.screen.getPrimaryDisplay().workAreaSize;
        random_size.x = screen_size.width - gif_size.width;
        random_size.y = screen_size.height - gif_size.height;
        setInterval(main.showOne, 100);
    },
    showOne: function(){
        var length = json.length;
        var index = parseInt(Math.random() * length);
        window_config.x = parseInt(Math.random() * random_size.x);
        window_config.y = parseInt(Math.random() * random_size.y);
        (new browserWindow(window_config)).webContents.loadURL(json[index].icon);
    },
    saveGifs: function(){
        mainSession.on('will-download', function(event, item, webContents) {
            if(item.getFilename().indexOf('gif') == -1){
                return;
            }

            var oneJson = main.fromUrl(item.getURL());
            if(oneJson != null){
                item.setSavePath(gifs_path + oneJson.id + '_' + oneJson.title + '.gif');
            }
            item.on('done', function(e, state) {
                if (state == 'completed') {
                    main.log('Gif Get! ( ^_^ )');
                } else {
                    main.log('Gif Get Failed!');
                }
            });
        });

        for(var one in json){
            mainWebContents.downloadURL(json[one].icon);
        }
    },
    fromUrl: function(url) {
        for (var one in json) {
            if (url == json[one].icon) {
                return json[one];
            }
        }
        return null;
    }
};

app.on('ready', main.ready);