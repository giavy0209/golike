import React,{useState,useCallback, useEffect} from 'react';

export default function Autorun({className,ipcRenderer,UserGolike,PassGolike,setGlobalListAccoutHas}){
    const [Alert, setAlert] = useState('')
    const [ListAccount, setListAccount] = useState([])
    const [ListAccountHas, setListAccountHas] = useState([])
    const [IsCheckGolike, setIsCheckGolike] = useState(false)
    const [AccountFB, setAccountFB] = useState('')
    const [PasswordFB, setPasswordFB] = useState('');
    const [AccountFBID, setAccountFBID] = useState('');

    const openGolike = useCallback(()=>{
        ipcRenderer.send('open-golike',{username: UserGolike, password: PassGolike})
        setIsCheckGolike(true)
        setAlert('Đang kiểm tra tài khoản của bạn...')
    },[ipcRenderer,UserGolike,PassGolike])

    useEffect(()=> {
        ipcRenderer.on('wrong-account',()=>{setAlert('Sai tên đăng nhập hoặc mật khẩu golike') ; setIsCheckGolike(true)})
        ipcRenderer.on('send-list-account',(e,{listAccount,data})=>{
            setListAccount([...listAccount]);
            setListAccountHas([...data])
            setGlobalListAccoutHas([...data])
            setAlert('');
        })
        ipcRenderer.on('loged-fb',(e,data)=>{
            setAlert('Đăng nhập facebook thành công. Bạn có thể dùng tài khoản facebook này để chạy golike. Bạn cũng có thể thêm các tài khoản facebook khác(Tối đa nên chạy 3-5 tài khoản facebook/ máy để hạn chế checkpoint')
            setListAccountHas([...data])
            setGlobalListAccoutHas([...data])
        })
        ipcRenderer.on('wrong-fb-account',()=>{
            setAlert('Đăng nhập facebook thất bại, kiểm tra lại tên đăng nhập hoặc mật khẩu.')
        })
    },[ipcRenderer,setGlobalListAccoutHas])

    const checkLoginFB = useCallback(()=>{
        ipcRenderer.send('check-login-fb',{AccountFB,PasswordFB,AccountFBID,UserGolike})
    },[AccountFB,PasswordFB,AccountFBID,ipcRenderer,UserGolike])
    return(
        <div className={className}>
            <div className={IsCheckGolike ? 'dp-n' : 'dp-b'}>
                <p> {UserGolike !=='' && PassGolike !== '' ? 'Bạn đã cài đặt tài khoản golike, Bấm đăng nhập để xác thực tài khoản của bạn' : 'Bạn chưa cài đặt tài khoản golike, vui lòng quay lại tab (TK Golike) để cài đặt tên đăng nhập và mật khẩu'} </p>
                <button className={UserGolike !=='' && PassGolike !== ''  ? 'dp-b' : 'dp-n'} onClick={openGolike}>Đăng nhập golike</button>
            </div>
            <div className={!IsCheckGolike ? 'dp-n' : 'dp-b'}>
                <input value={AccountFB} onChange={e=>{setAccountFB(e.target.value)}} placeholder="tài khoản facebook"/>
                <input value={PasswordFB} onChange={e=>{setPasswordFB(e.target.value)}} type="password" placeholder="mật khẩu facebook"/>
                <button onClick={()=>{checkLoginFB()}}>Kiểm tra đăng nhập facebook</button>
                <p>Chọn đúng tài khoản facebook trên golike phía dưới. Nếu chọn sai, khi auto bạn sẽ không nhận được tiền và bị lỗi job.</p>
            </div>
            <p> {Alert} </p>
            {
                ListAccount.map(account=>{
                    return(
                        <div className="list-account">
                            <div className="name">
                                <img className="list-account-img" src={account.avata} alt=""/>
                                <span>{account.name}</span>
                                {
                                    ListAccountHas.map(accountHas=>{
                                        if(accountHas.id === account.avata)  return (<span style={{fontSize:12}}>TKFB: {accountHas.username}</span>) 
                                        return null
                                    })
                                }
                            </div>
                            <div>
                                <input value={account.avata} onChange={e=>{
                                    setAccountFBID(e.target.getAttribute('value'))
                                    console.log(e.target.getAttribute('value'))
                                }} type="radio" name="fbid"/>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}