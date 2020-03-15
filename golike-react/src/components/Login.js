import React,{useEffect,useState,useCallback} from 'react';

export default function(props){
    let {setDisplayLoading,socket,loginSuccess,ipcRenderer,className,setGlobalListAccoutHas} = props
    const [Alert,setAlert] = useState('')
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = useCallback(()=>{
        if(username.length <6 || password.length < 6){
            setAlert('Tên đăng nhập và mật khẩu phải dài hơn 6 ký tự')
        }else{
            setDisplayLoading(0.8)
            socket.emit('client-login',{username, password})
        }
    },[username,password,socket,setDisplayLoading])
    const reg = useCallback(()=>{
        if(username.length <6 || password.length < 6){
            setAlert('Tên đăng nhập và mật khẩu phải dài hơn 6 ký tự')
        }else{
            setDisplayLoading(0.8)
            socket.emit('client-reg',{username, password})
        }
    },[username,password,setDisplayLoading,socket])

    useEffect(()=>{
        socket.on('login-fail',function(){
            setDisplayLoading(0)
            setAlert('Sai tên đăng nhập hoặc mật khẩu')
        })
        socket.on('login-success', function(data){
            setDisplayLoading(0)
            loginSuccess(data)
            console.log(data)
        })
        socket.on('reg-fail',function(){
            setDisplayLoading(0)
            setAlert('Tên đăng nhập đã tồn tại')
        })
        socket.on('reg-success',function(){
            setDisplayLoading(0)
            setAlert('Đăng ký thành công, vui lòng bấm đăng nhập')
        })

        ipcRenderer.send('req-userInfo')

        ipcRenderer.on('res-userInfo',(event,{data,listAccount})=>{
            if(data.username && data.password){
                setDisplayLoading(0.8)
                socket.emit('client-login',data)
                setGlobalListAccoutHas([...listAccount])
            }
        })
    },[ipcRenderer,setDisplayLoading,socket,loginSuccess,setGlobalListAccoutHas])
    return(
        <div className={className}>
        <p>Đăng nhập hoặc đăng ký nếu chưa có tài khoản</p>
        <input value={username} onChange={((e)=>setUsername(e.target.value))} placeholder="Tên đăng nhập"></input>
        <input value={password} type="password" onChange={((e)=>setPassword(e.target.value))} placeholder="Mật khẩu"></input>
        <button onClick={login}>Đăng nhập</button>
        <button onClick={reg}>Đăng ký</button>
        <p>{Alert}</p>
        </div>
    )
}