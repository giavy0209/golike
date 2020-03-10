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
let mainWindow, subWindow,checkFBWindow, autoRunWindow;
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

        var data = JSON.parse(fs.readFileSync(path.join(__dirname,'./account.json')))

        mainWindow.webContents.send('send-list-account',{listAccount,data})
        subWindow.close()
        }, 5000);
    }else{
        mainWindow.webContents.send('wrong-account')
        subWindow.close()
    }
}

async function createCheckFBWindow(AccountFB,PasswordFB,AccountFBID){
    checkFBWindow = new BrowserWindow({
        width: 800,
        height: 20000,
        resizable :false,
        minimizable:false,
        maximizable:false,
    })
    checkFBWindow.webContents.session.clearStorageData()
    checkFBWindow.loadURL('https://m.facebook.com')
    await checkFBWindow.webContents.executeJavaScript(`
        document.getElementById('m_login_email').value = '${AccountFB}'
        document.getElementById('m_login_password').value = '${PasswordFB}'
        document.querySelector('form button').click()
    `)

    await waitFor(5000)
    checkFBWindow.loadURL('https://m.facebook.com')

    var isLoged = await checkFBWindow.webContents.executeJavaScript(`
        function checkLogin(){
            return !document.getElementById('m_login_email')
        }
        checkLogin()
    `)
    
    if(isLoged){
        var oldData = JSON.parse(fs.readFileSync(path.join(__dirname,'./account.json')))
        var obj = {
            username:AccountFB,
            password:PasswordFB,
            id: AccountFBID,
        }

        var index =  oldData.findIndex(o=> o.id === AccountFBID)
        if(index !== -1){
            oldData.splice(index, 1)
            oldData.push(obj)
        }
        oldData.push(obj)

        let newData = JSON.stringify(oldData, null, 2);

        fs.writeFileSync(path.join(__dirname,'./account.json'), newData)
        mainWindow.webContents.send('loged-fb', oldData);
    }else mainWindow.webContents.send('wrong-fb-account')

    checkFBWindow.close()
}   

async function createAutoRunWindow(username,password,accountid){
    autoRunWindow = new BrowserWindow({
        width: 800,
        height: 20000,
        resizable :false,
        minimizable:false,
        maximizable:false,
    })
    autoRunWindow.webContents.openDevTools()
    await autoRunWindow.loadURL('https://app.golike.net')
    await autoRunWindow.webContents.executeJavaScript(`document.querySelector('form input[type="text"]').focus()`)
    await autoRunWindow.webContents.insertText(username)

    await autoRunWindow.webContents.executeJavaScript(`document.querySelector('form input[type="password"]').focus()`)
    await autoRunWindow.webContents.insertText(password)
    await autoRunWindow.webContents.executeJavaScript(`document.querySelector('form button[type="submit"]').click()`)
    await waitFor(5000)
    var currentURL = autoRunWindow.webContents.getURL()
    if(currentURL === 'https://app.golike.net/home'){
        await autoRunWindow.webContents.loadURL('https://app.golike.net/jobs/facebook')
        await autoRunWindow.webContents.executeJavaScript(`
            document.querySelectorAll('.card.shadow-200.mt-1 img').forEach(el=>{
                if(el.getAttribute('src') === '${accountid}') el.click()
            })
        `)
        await waitFor(15000)
    }else{
        mainWindow.webContents.send('wrong-account')
        autoRunWindow.close()
    }
}

//==========================End Create Windows========================

//===========================IPC event =========================
ipcMain.on('login-success',(e,{username,password})=>{
    storage.set('user-info', {username,password})
})
ipcMain.on('req-userInfo',()=>{
    storage.get('user-info',(err,data)=>{
        var listAccount = JSON.parse(fs.readFileSync(path.join(__dirname,'./account.json')))
        mainWindow.webContents.send('res-userInfo',{data,listAccount})
    })
})
ipcMain.on('open-golike',(e,{username, password,shortID})=>{
  createSubWindow(username,password,shortID)      
})

ipcMain.on('check-login-fb',(e,{AccountFB,PasswordFB,AccountFBID})=>{
    createCheckFBWindow(AccountFB,PasswordFB,AccountFBID)
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