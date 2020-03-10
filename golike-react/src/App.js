import React,{useState,useCallback,} from 'react';
import './App.css';
import io from 'socket.io-client'

import Login from './components/Login'
import GolikeAccount from './components/GolikeAccount'
import Loading from './components/Loading'
import Footer from './components/Footer'
import Autorun from './components/Autorun';

const electron = window.require('electron')
const {ipcRenderer} = electron;
const connectionConfig = {
  jsonp: false,
  reconnection: true,
  reconnectionDelay: 100,
  reconnectionAttempts: 100000
};
const socket = io('http://localhost:3001',connectionConfig)

function App() {
  const [DisplayLoading, setDisplayLoading] = useState(0);
  const [UserGolike, setUserGolike] = useState('');
  const [PassGolike, setPassGolike] = useState('');
  const [Username, setUsername] = useState('')
  const [Password, setPassword] = useState('')
  const [FooterTab, setFooterTab] = useState('login')

  const loginSuccess = useCallback(({userGolike,passGolike, shortID, username,password})=>{
    setUserGolike(userGolike)
    setPassGolike(passGolike)
    setUsername(username)
    setPassword(password)
    setFooterTab('account')
    ipcRenderer.send('login-success',{username, password})
  },[]);

  const changeTab = useCallback((tabName)=>{
    setFooterTab(tabName)
  },[])
  return (
    <>
    <div className="pp-container">
      <Login
      className={FooterTab==='login'? 'dp-b' : 'dp-n'}
      socket={socket}
      ipcRenderer={ipcRenderer}
      loginSuccess={loginSuccess}
      setDisplayLoading={setDisplayLoading}
      />
      <GolikeAccount
      className={FooterTab==='account'? 'dp-b' : 'dp-n'}
      UserGolike={UserGolike}
      setUserGolike={setUserGolike}
      setPassGolike={setPassGolike}
      PassGolike={PassGolike}
      Username={Username}
      Password={Password}
      socket={socket}
      />
      <Autorun
      className={FooterTab==='autorun'? 'dp-b' : 'dp-n'}
      ipcRenderer={ipcRenderer}
      UserGolike={UserGolike}
      PassGolike={PassGolike}
      />
    </div>
    <Footer
    className={FooterTab==='login'? 'dp-n' : 'dp-p'}
    FooterTab={FooterTab}
    changeTab={changeTab}
    />
    <Loading DisplayLoading={DisplayLoading}/>
    </>
  );
}

export default App;
