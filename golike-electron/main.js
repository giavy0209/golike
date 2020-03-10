//==============NodeJS module=======================
const path = require('path')
const os = require('os');
const fs = require('fs')
const childProcess = require('child_process')

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

//=================Electron path=========================
const {BrowserWindow, Menu, ipcMain, app} = require('electron');

const io = require('socket.io-client')
const storage = require('electron-json-storage');

const isDev = process.env.NODE_ENV == 'dev'
const socketDomain = 'http://localhost:3001';
const siteDomain = isDev ? 'http://localhost:3000' : 'https://google.com';

const socket = io(socketDomain)

//======================Windows variant=====================
let mainWindow, subWindow;
//======================End Windows variant=============

//======================Create Windows======================
function createMainWindow(){
    mainWindow = new BrowserWindow({
        width: 800,
        height: 20000,
        resizable :false,
        minimizable:false,
        maximizable:false,
        webPreferences: {
            nodeIntegration: true,
            // nativeWindowOpen: true,
            webviewTag:true
        }
    })
    mainWindow.loadURL(siteDomain);
    isDev && mainWindow.webContents.openDevTools()

    //===========================Socket event=======================

    //===========================End Socket event===================
}

async function createSubWindow(username, password){
    subWindow = new BrowserWindow({
        width: 800,
        height: 20000,
        resizable :false,
        minimizable:false,
        maximizable:false,
    })
    subWindow.webContents.session.clearStorageData()
    subWindow.loadURL('https://app.golike.net')
    subWindow.webContents.openDevTools()
    if(username !== '' && password !==''){
        await subWindow.webContents.executeJavaScript(`document.querySelector('form input[type="text"]').focus()`)
        await subWindow.webContents.insertText(username)

        await subWindow.webContents.executeJavaScript(`document.querySelector('form input[type="password"]').focus()`)
        await subWindow.webContents.insertText(password)
        await subWindow.webContents.executeJavaScript(`document.querySelector('form button[type="submit"]').click()`)
        await waitFor(5000)
        var currentURL = subWindow.webContents.getURL()
        if(currentURL === 'https://app.golike.net/home'){
            setTimeout(async () => {
                await subWindow.webContents.loadURL('https://app.golike.net/jobs/facebook')
    
            var listAccount = await subWindow.webContents.executeJavaScript(`
                function getList(){
                    var listAccount = [];
                    document.querySelectorAll('.card.shadow-200.mt-1').forEach(el=>{
                        var name = el.innerText.replace('check','').trim()
                        var avata = el.querySelector('img').getAttribute('src')
                        var obj ={
                            name,
                            avata
                        }
                        listAccount.push(obj)
                    })
                    return listAccount
                }
                getList()
            `)
            mainWindow.webContents.send('send-list-account',listAccount)
            subWindow.close()
            }, 5000);
        }else{
            mainWindow.webContents.send('wrong-account')
            subWindow.close()
        }
    }else{
        //==========not set golike account==============
    }
}
//==========================End Create Windows========================

//===========================IPC event =========================
ipcMain.on('login-success',(e,{username,password})=>{
    storage.set('user-info', {username,password})
})
ipcMain.on('req-userInfo',()=>{
    storage.get('user-info',(err,data)=>{
        mainWindow.webContents.send('res-userInfo',data)
    })
})
ipcMain.on('open-golike',(e,{username, password,shortID})=>{
  createSubWindow(username,password,shortID)      
})
//===========================End IPC event======================

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