import React,{useState,useEffect,useCallback} from 'react';

export default function GolikeAccount({UserGolike,setUserGolike,PassGolike,setPassGolike,socket,Username,Password,className}){
    const [Alert,setAlert] = useState('');

    const saveGolikeAccount = useCallback(()=>{
        socket.emit('client-edit-golike-account',{Username,Password,UserGolike,PassGolike})
    },[PassGolike, UserGolike,Username,Password,socket])

    useEffect(()=>{
        socket.on('edit-golike-account-success',()=>{
            setAlert('Lưu tài khoản Golike thành công')
        })
    },[socket])

    return(
        <div className={className}>
            <p style={{textAlign:'center'}}>Thêm tài khoản golike</p>
            <p>Để admin app này sống được, các bạn vui lòng sử dùng tài khoản ref cho admin. Link ref: <a target="_blank" rel="noopener noreferrer" href="http://t7r.golikeapp.work/share/qqyb7e.html?referral_code=giavy0209">http://t7r.golikeapp.work/share/qqyb7e.html?referral_code=giavy0209</a></p>
            <p>Chúng tôi không thể xem thông tin tài khoản của bạn, mọi dữ liệu đều được mã hóa an toàn, nếu bạn lo lắng vấn đề bảo mật bạn có thể bỏ qua bước này và đăng nhập bằng tay mỗi lần mở ứng dụng</p>
            <input value={UserGolike} onChange={e=>{setUserGolike(e.target.value); }} placeholder="Tên đăng nhập golike"></input>    
            <input value={PassGolike} onChange={e=>setPassGolike(e.target.value)} placeholder="Mật khẩu golike"></input>
            <p> {Alert} </p>
            <button onClick={saveGolikeAccount}>Lưu</button>
        </div>
    )
}