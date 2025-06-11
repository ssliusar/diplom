import React from 'react';
import './homePage.scss'
import {Card} from "antd";
import AboutPage from "../AboutPage/AboutPage.jsx";
import TopBanner from "../../Components/TopBanner/TopBanner.jsx";

const HomePage = () => {

    return (
        <div className="wrapper">
            <div className='firstContent'>
                <TopBanner input={true}/>
                <div style={{padding:'100px 0 0'}}>
                    <AboutPage banner={false}/>
                </div>
            </div>


        </div>
    );
};

export default HomePage;