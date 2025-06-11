import React from 'react';
import {Button} from "antd";
import './notFoundPage.scss'
import notFoundPageImage from '../../Assets/Images/notFoundPage.gif'
const NotFoundPage
= () => {
    return (
        <div className='wrapper'>
        <div className="notFoundPage">
            <img src={notFoundPageImage} alt=""/>
            <Button type={'link'} href={'/'} >Повернутись на головну</Button>
        </div>
        </div>

    );
};

export default NotFoundPage;