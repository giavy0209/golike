import React, {useCallback,} from 'react'

export default function Footer({FooterTab,changeTab,className}){
    const checkActive = useCallback((tabName)=>{
        if(tabName === FooterTab){
            return "active"
        }else{
            return ""
        }
    },[FooterTab])
    return(
        <footer className={className}>
            <div onClick={()=>{changeTab('account')}} className={checkActive('account')}>
                <i className="fas fa-home"></i>
                <p>TK Golike</p>
            </div>
            <div onClick={()=>{changeTab('autorun')}} className={checkActive('autorun')}>
                <i className="fas fa-dollar-sign"></i>
                <p>Kiếm tiền nào</p>
            </div>
        </footer>
    )
}