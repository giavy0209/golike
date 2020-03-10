import React from 'react'
import loading from '../assets/loading.gif'
export default function Header({DisplayLoading}){
    return(
        <div className={DisplayLoading === 0? "mask-loading off" : "mask-loading"}>
            <img alt="" src={loading}/>
        </div>
    )
}
