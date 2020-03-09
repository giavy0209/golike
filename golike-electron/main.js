//==============NodeJS module=======================
const path = require('path')
const os = require('os');
const fs = require('fs')
const childProcess = require('child_process')

//=================Electron path=========================
const {BrowserWindow, Menu, ipcMain, app} = require('electron');

const io = require('socket.io-client')
const storage = require('electron-json-storage');

const isDev = process.env.NODE_ENV == 'dev'
const socketDomain = '';
const siteDomain = isDev ? 'http://localhost:3000' : 'https://google.com';

const socket = io(socketDomain)

//======================Windows variant=====================
let mainWindow
//======================End Windows variant=============

//======================Create Windows======================
function createMainWindow(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        resizable :false,
        minimizable:false,
        maximizable:false,
        webPreferences: {
            nodeIntegration: true,
            nativeWindowOpen: true,
            webviewTag:true
        }
    })
    mainWindow.loadURL(siteDomain);
    isDev && mainWindow.webContents.openDevTools()

    //===========================IPC event =========================

    //===========================End IPC event======================

    //===========================Socket event=======================

    //===========================End Socket event===================

}
//==========================End Create Windows========================

//=======================Check duplicate app=================
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}
//===========================End Check==========================

//============================Menu===================
const mainMenuTemplate = [];
const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
Menu.setApplicationMenu(mainMenu)
//==============================End Menu====================

//====================Start/quit app=========================
app.on('ready', ()=>{
    createMainWindow()
})
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
})