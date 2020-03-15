import React, { useCallback, useEffect, useState } from 'react'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
export default function EarnMoney({GlobalListAccoutHas,className,ipcRenderer,UserGolike,PassGolike,setGlobalListAccoutHas}){
    const [IDRunning, setIDRunning] = useState('')
    const [IsRunning, setIsRunning] = useState(false)
    const [Alert, setAlert] = useState('')
    const runEarnMoney = useCallback(()=>{
        if(IsRunning){
            ipcRenderer.send('stop')
        }else{
            ipcRenderer.send('start-autorun',{UserGolike,PassGolike})
        }
    },[ipcRenderer,UserGolike,PassGolike,IsRunning])

    useEffect(()=>{
        ipcRenderer.on('id-running',(e,id)=>{
            setIDRunning(id)
            setIsRunning(true)
        })
        ipcRenderer.on('stoped',()=>setIsRunning(false))
        ipcRenderer.on('finish',()=>{
            setIDRunning('')
            setIsRunning(false)
            setAlert('Đã chạy xong, bạn nên để 5 facebook vừa chạy xong nghỉ 1-2 ngày rồi mới dùng tiếp')
        })
        ipcRenderer.on('deleted-facebook',(e,data)=>{
            setGlobalListAccoutHas(data)
        })
    },[ipcRenderer,setGlobalListAccoutHas])

    const deleteBtn = useCallback((id)=>{
        confirmAlert({
            message: 'Bạn có chắc muốn xóa?',
            buttons: [
              {
                label: 'Yes',
                onClick: () => {
                    ipcRenderer.send('delete-facebook',id)
                }
              },
              {
                label: 'No',
              }
            ]
          });
    },[ipcRenderer])


    return(
        <div className={className}>
            <p>Tool chỉ chạy công việc like, tuy nó ít tiền nhưng rất khó bị checkpoint, bạn có thể chạy gần như bất tử với 3-5 tài khoản facebook/máy</p>
            <p>Tool sẽ lọc ra công việc có tiền nhiều nhất chạy trước, lần lượt từng tài khoảng sẽ chạy đến khi giới hạn hoặc hết việc làm sẽ đổi tài khoản khác</p>
            <p>1 tài khoản chạy 100job mất khoảng 3-5 giờ. Các bạn không nên tắt mở tool liên tục sẽ ảnh hưởng đến chất lượng tài khoản facebook của bạn</p>
            <button onClick={runEarnMoney}> {IsRunning? 'Dừng' : 'Bắt đầu chạy.'} </button>
            <p> {Alert} </p>
            <div className="list-account-added">
                <p>Danh sách tài khoản facebook:</p>
                {
                    GlobalListAccoutHas.map(account=>{
                        return(
                            <div key={account.id} className="account-added">
                                <img src={account.id} alt=""/>
                                <span>
                                    <span>TKFB: {account.username}</span>
                                    {
                                        IsRunning && IDRunning === account.id && <p style={{fontSize:14, color: '#00ff00'}}> Đang chạy </p>
                                    }
                                    <button onClick={()=>deleteBtn(account.id)} className="delete">Xóa</button>
                                </span>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}