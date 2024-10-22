import React,{useState,useCallback, useEffect,} from 'react';
import './App.css';
import io from 'socket.io-client'

import Login from './components/Login'
import GolikeAccount from './components/GolikeAccount'
import Loading from './components/Loading'
import Footer from './components/Footer'
import Account from './components/Account';
import EarnMoney from './components/EarnMoney';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

const electron = window.require('electron')
const {ipcRenderer} = electron;
const connectionConfig = {
  jsonp: false,
  reconnection: true,
  reconnectionDelay: 100,
  reconnectionAttempts: 100000
};
const socket = io('https://autogolike.com',connectionConfig)

function App() {
  const [DisplayLoading, setDisplayLoading] = useState(0);
  const [UserGolike, setUserGolike] = useState('');
  const [PassGolike, setPassGolike] = useState('');
  const [Username, setUsername] = useState('')
  const [Password, setPassword] = useState('')
  const [FooterTab, setFooterTab] = useState('login')
  const [GlobalListAccoutHas, setGlobalListAccoutHas] = useState([])

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
    console.log(tabName)
  },[])

  useEffect(()=>{
    ipcRenderer.on('not-enought-file',()=>{
      confirmAlert({
        message: 'Có vẻ chương trình diệt virus nào đó đã ăn mất vài file cần thiết. Bạn vui lòng tắt diệt virus và mở lại app nhé',
        buttons: [
          {
            label: 'OK',
            onClick: () => {
                ipcRenderer.send('quit',)
            }
          }
        ]
      });
    })
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
      setGlobalListAccoutHas={setGlobalListAccoutHas}
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
      <Account
      className={FooterTab==='account-manager'? 'dp-b' : 'dp-n'}
      ipcRenderer={ipcRenderer}
      UserGolike={UserGolike}
      PassGolike={PassGolike}
      setGlobalListAccoutHas={setGlobalListAccoutHas}
      />
      <EarnMoney
      className={FooterTab==='earnmoney'? 'dp-b' : 'dp-n'}
      GlobalListAccoutHas={GlobalListAccoutHas}
      setGlobalListAccoutHas={setGlobalListAccoutHas}
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
