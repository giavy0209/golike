import React,{useState,useCallback, useEffect} from 'react';

export default function Autorun({className,ipcRenderer,UserGolike,PassGolike}){
    const [Alert, setAlert] = useState('')
    const [ListAccount, setListAccount] = useState([])
    const [IsCheckGolike, setIsCheckGolike] = useState(false)

    const openGolike = useCallback(()=>{
        ipcRenderer.send('open-golike',{username: UserGolike, password: PassGolike})
        setIsCheckGolike(true)
        setAlert('Đang kiểm tra tài khoản của bạn...')
    },[ipcRenderer,UserGolike,PassGolike])

    useEffect(()=> {
        ipcRenderer.on('wrong-account',()=>{setAlert('Sai tên đăng nhập hoặc mật khẩu golike') ; setIsCheckGolike(true)})
        ipcRenderer.on('send-list-account',(e,listAccount)=>{setListAccount([...listAccount]);setAlert('');})
    },[ipcRenderer])

    const checkLoginFB = useCallback((id)=>{
        
    },[])
    return(
        <div className={className}>
            <div className={IsCheckGolike ? 'dp-n' : 'dp-b'}>
                <p> {UserGolike !=='' && PassGolike !== '' ? 'Bạn đã cài đặt tài khoản golike, Bấm đăng nhập để xác thực tài khoản của bạn' : 'Bạn chưa cài đặt tài khoản golike, bấm đăng nhập golike sau đó đăng nhập để xác minh tài khoản của bạn'} </p>
                <button onClick={openGolike}>Đăng nhập golike</button>
            </div>
            {
                ListAccount.map(account=>{
                    return(
                        <div className="list-account">
                            <div className="name">
                                <img className="list-account-img" src={account.avata} alt=""/>
                                <span>{account.name}</span>
                            </div>
                            <div>
                                <input placeholder="Tên đăng nhập"/>
                                <input placeholder="Mật khẩu"/>
                                <button onClick={()=>checkLoginFB(account.avata)}>Kiểm tra đăng nhập facebook</button>
                            </div>
                        </div>
                    )
                })
            }
            <p> {Alert} </p>
        </div>
    )
}