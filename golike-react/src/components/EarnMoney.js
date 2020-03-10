import React, { useCallback } from 'react'

export default function EarnMoney({GlobalListAccoutHas,className,ipcRenderer}){
    const runEarnMoney = useCallback(()=>{

    })
    return(
        <div className={className}>
            <p>Tool chỉ chạy công việc like, tuy nó ít tiền nhưng rất khó bị checkpoint, bạn có thể chạy gần như bất tử với 3-5 tài khoản facebook/máy</p>
            <p>Tool sẽ lọc ra công việc có tiền nhiều nhất chạy trước, lần lượt từng tài khoảng sẽ chạy đến khi giới hạn hoặc hết việc làm sẽ đổi tài khoản khác</p>
            <p>1 tài khoản chạy 100job mất khoảng 3-5 giờ. Các bạn không nên tắt mở tool liên tục sẽ ảnh hưởng đến chất lượng tài khoản facebook của bạn</p>
            <button>Bắt đầu chạy.</button>
            <div className="list-account-added">
                <p>Danh sách tài khoản facebook:</p>
                {
                    GlobalListAccoutHas.map(account=>{
                        return(
                            <div className="account-added">
                                <img src={account.id} alt=""/>
                                <span>
                                    <span>TKFB: {account.username} | PasswordFB: {account.password} </span>
                                </span>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}