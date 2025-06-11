import React from 'react';
import './header.scss'
import logo from '../../Assets/Images/logo.png'
import pointsIcon from '../../Assets/Images/pointsIcon.png'
import logoutIcon from '../../Assets/Images/logout.png'
import {Button} from "antd";
import {Link} from "react-router-dom";
import {useAuth} from "../AuthContext/AuthContext.jsx";
const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header>
            <div className="wrapper">
                <a href={'/'} className="logo">
                    <img src={logo} alt="Logo"/>
                    <p>Спільнота Взаємодопомоги
                        "Обмінюй з користю"</p>
                </a>
                <ul>
                    <li>
                        <Link to={'/catalog'}>Каталог</Link>
                    </li>
                    {user?.isValid ?
                        <li>
                            <Link to={'/lottery'}>Розіграші</Link>
                        </li>
                        :
                        <></>
                    }
                    <li>
                    <Link to={'/about'}>Про нас</Link>
                    </li>
                    <li>
                        <Link to={'/question'}>ЧаПи</Link>
                    </li>
                </ul>
                <div style={{display:'flex', alignItems:'center'}}>
                    {user?.isValid ?
                        <div style={{display:'flex', alignItems:'center',marginRight:'14px'}}>
                            <img style={{maxWidth: '20px'}} src={pointsIcon} alt="Points"/>
                            <span style={{height:'20px',fontSize:'22px', marginLeft:'6px'}}>{user?.points || 0}</span>
                        </div>
                        :
                        <></>
                    }
                    <Button type={'primary'} href={user?.isValid ? user?.type === 'user' ? '/panel' : user?.type === 'manager' ? '/manager' : '/admin' : '/login'} className="authorization">Особистий кабінет</Button>
                    {user?.isValid ? <Button type={'default'} style={{maxWidth:'60px', marginLeft:'10px'}} onClick={logout} danger className="authorization"><img src={logoutIcon} alt='logout'/></Button> : <></> }
                </div>
            </div>
        </header>
    );
};

export default Header;