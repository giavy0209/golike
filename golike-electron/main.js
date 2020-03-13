//==============NodeJS module=======================
const path = require('path')
const os = require('os');
const fs = require('fs')
const childProcess = require('child_process')

const waitFor = (ms) => new Promise(r => setTimeout(r, ms));

async function loopJob( callback) {
    for (let index = 0; index < 1; index++) {
      await callback();
    }
}

function randomTime(){
    var time = (Math.random()*15 + 15)*1000
    return time
}

//=================Electron path=========================
const {BrowserWindow, Menu, ipcMain, app} = require('electron');

const io = require('socket.io-client')
const storage = require('electron-json-storage');

const isDev = process.env.NODE_ENV == 'dev'
const socketDomain = 'http://localhost:3001';
const siteDomain = isDev ? 'http://localhost:3000' : 'https://google.com';

const socket = io(socketDomain)

//======================Windows variant=====================
let mainWindow, subWindow,checkFBWindow, autoRunWindow, facebookJobWindow;
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

    mainWindow.on('closed',()=>{
        app.quit()
    })
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

async function createCheckFBWindow(AccountFB,PasswordFB,AccountFBID,UserGolike){
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
        console.log(isLoged)
        var oldData = JSON.parse(fs.readFileSync(path.join(__dirname,'./account.json')))
        var obj = {
            username:AccountFB,
            password:PasswordFB,
            id: AccountFBID,
            owner:UserGolike,
        }

        var index =  oldData.findIndex(o=> o.id === AccountFBID)
        if(index !== -1){
            oldData.splice(index, 1)
        }
        oldData.push(obj)

        let newData = JSON.stringify(oldData, null, 2);

        socket.emit('add-accoung-fb',obj)

        fs.writeFileSync(path.join(__dirname,'./account.json'), newData)
        mainWindow.webContents.send('loged-fb', oldData);
    }else mainWindow.webContents.send('wrong-fb-account')

    checkFBWindow.close()
}   

async function createAutoRunWindow(username,password,accountid){
    try {
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
        await waitFor(randomTime())
        var currentURL = autoRunWindow.webContents.getURL()
        if(currentURL === 'https://app.golike.net/home'){
            await autoRunWindow.webContents.loadURL('https://app.golike.net/jobs/facebook')
            await waitFor(randomTime())

            await autoRunWindow.webContents.executeJavaScript(`
            document.querySelectorAll('.col-auto.pl-0.pr-2').forEach(el=>{
                el.click()
            })
            `)
            await waitFor(randomTime())
    
            await autoRunWindow.webContents.executeJavaScript(`
                document.querySelectorAll('.card.shadow-200.mt-1 img').forEach(el=>{
                    if(el.getAttribute('src') === '${accountid}') el.click()
                })
            `)
            //start loop job
            
            for (let index = 0; index < 1; index--) {
                autoRunWindow.webContents.loadURL('https://app.golike.net/jobs/facebook')
                await waitFor(randomTime());
                await autoRunWindow.webContents.executeJavaScript(`
                    document.querySelectorAll('.material-icons.bg-gradient-1').forEach(el=>{if(el.innerText == 'refresh'){el.click()}})
                `)
                await waitFor(randomTime())
                var listPrice = await autoRunWindow.webContents.executeJavaScript(`
                    function getPrice(){
                        var like  = document.querySelectorAll('.card.mb-2 .card-body img[src="../../assets/images/icons-gif/like.gif"]');
                        var follow = document.querySelectorAll('.card.mb-2 .card-body img[src="../../assets/images/icons-gif/follow.svg"]');
                        var likePage = document.querySelectorAll('.card.mb-2 .card-body img[src="../../assets/images/icons-gif/like_page.gif"]');

                        if(like.length > 0 || follow.length > 0 || likePage.length > 0){
                            var listAvaiablePrice = [];
                            like.forEach(el=>{
                                el.nextElementSibling.firstChild.firstChild
                                listAvaiablePrice.push(el.nextElementSibling.firstChild.firstChild)
                            })
                            likePage.forEach(el=>{
                                el.nextElementSibling.firstChild.firstChild
                                listAvaiablePrice.push(el.nextElementSibling.firstChild.firstChild)
                            })
                            follow.forEach(el=>{
                                el.nextElementSibling.firstChild.firstChild
                                listAvaiablePrice.push(el.nextElementSibling.firstChild.firstChild)
                            })

                            var high = Number(listAvaiablePrice[0].innerText);
                            var html = listAvaiablePrice[0]
                            listAvaiablePrice.forEach(el=>{
                                if(Number(el.innerText > high)){
                                    high = Number(el.innerText);
                                    html = el
                                }

                            })
                            html.click()
                            return true
                        }else{
                            return false
                        }
                    }
                    getPrice()
                `)
                
                if(listPrice){
                    await waitFor(20000)
                    //======================prevent open _blank and return value=================
                    var link = await autoRunWindow.webContents.executeJavaScript(`
                        function getLink(){
                            var linkEl = document.querySelector('.card.card-job-detail a:last-child')
                            if(!linkEl) return false
                            linkEl.addEventListener('click',e=>{
                                e.preventDefault()
                            })
                            linkEl.click()
                            var link = linkEl.getAttribute('href')
                            return link
                        }
                        getLink()
                    `)
                    if(link){
                        facebookJobWindow.loadURL(link)
                        await waitFor(randomTime())

                        var isLogouted = await facebookJobWindow.webContents.executeJavaScript(`
                            function checkLogout(){
                                if(document.querySelectorAll('div > a > span')){
                                    if(document.querySelectorAll('div > a > span').innerText){
                                        return true
                                    }else return false
                                }else return false
                            }
                            checkLogout()
                        `)
                        
                        if(!isLogouted){
                            await facebookJobWindow.webContents.executeJavaScript(`
                            document.querySelectorAll('a[role="button"]').forEach(el=>{
                                if(el.innerText ==='Thích') el.click()
                            })
                            document.querySelectorAll('a').forEach(el=>{
                                if(el.getAttribute('href')){
                                if(el.getAttribute('href').includes('subscribe')) el.click()
                                }
                            })
                            document.querySelectorAll('a').forEach(el=>{
                                if(el.getAttribute('href')){
                                if(el.getAttribute('href').includes('pageSuggestions')) el.click()
                                }
                            })
                            `)
        
                            await waitFor(randomTime())
                            await autoRunWindow.webContents.executeJavaScript(`document.querySelectorAll('h6.font-bold').forEach(el=> el.innerText === 'Hoàn thành' && el.click())`)
                            await waitFor(randomTime())
                            var isSuccess = await autoRunWindow.webContents.executeJavaScript(`
                                function checkStatus(){
                                    if( document.getElementById('swal2-title')){
                                        var status = document.getElementById('swal2-title').innerText
                                        if(status ==='Thành công') return true
                                        else return false
                                    }
                                }
                                checkStatus()
                            `)
            
                            if(!isSuccess){
                                await autoRunWindow.webContents.executeJavaScript(`
                                if(document.querySelectorAll('h6.font-bold')){
                                    document.querySelectorAll('h6.font-bold').forEach(el=> {
                                        if(el.innerText && el.innerText === 'Báo lỗi'){
                                            el.click()  
                                            if(document.querySelectorAll('.row.align-items-center.mt-2')[3]){
                                                document.querySelectorAll('.row.align-items-center.mt-2')[3].click()
                                                if(document.querySelector('.btn.btn-primary.btn-sm.form-control.mt-3')){
                                                    document.querySelector('.btn.btn-primary.btn-sm.form-control.mt-3').click()
                                                }
                                            }
                                        } 
                                    })
                                }
                                `)
                                
                            }
                        }else{
                            facebookJobWindow.webContents.session.clearStorageData()
                            facebookJobWindow.loadURL('https://m.facebook.com')
                            facebookJobWindow.webContents.openDevTools()
                            await facebookJobWindow.webContents.executeJavaScript(`
                                document.getElementById('m_login_email').value = '${AccountFB}'
                                document.getElementById('m_login_password').value = '${PasswordFB}'
                                document.querySelector('form button').click()
                            `)
                        }

                    }
                }
            }
    
            //==================Get best price
            
    
        }else{
            mainWindow.webContents.send('wrong-account')
            autoRunWindow.close()
        }
    } catch (error) {
        console.log(error)
    }
}

async function createFacebooJobWindow(AccountFB,PasswordFB){
    facebookJobWindow = new BrowserWindow({
        width: 800,
        height: 20000,
        resizable :false,
        minimizable:false,
        maximizable:false,
    })
    facebookJobWindow.webContents.session.clearStorageData()
    facebookJobWindow.loadURL('https://m.facebook.com')
    facebookJobWindow.webContents.openDevTools()
    await facebookJobWindow.webContents.executeJavaScript(`
        document.getElementById('m_login_email').value = '${AccountFB}'
        document.getElementById('m_login_password').value = '${PasswordFB}'
        document.querySelector('form button').click()
    `)

    await waitFor(5000)
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

ipcMain.on('check-login-fb',(e,{AccountFB,PasswordFB,AccountFBID,UserGolike})=>{
    createCheckFBWindow(AccountFB,PasswordFB,AccountFBID,UserGolike)
})

ipcMain.on('start-autorun',async (e,{UserGolike,PassGolike})=>{
    var listAccount = JSON.parse(fs.readFileSync(path.join(__dirname,'./account.json')))
    for (let i = 0; i < listAccount.length; i++) {
        var {username,password,id} = listAccount[i]
        mainWindow.webContents.send('id-running',id)
        createFacebooJobWindow(username,password)
        await createAutoRunWindow(UserGolike,PassGolike,id)
        if(i === listAccount.length - 1){
            mainWindow.webContents.send('finish')
        }
    }
})

ipcMain.on('stop',()=>{
    facebookJobWindow.close()
    autoRunWindow.close()
    mainWindow.webContents.send('stoped')
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