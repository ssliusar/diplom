import React, {useState} from 'react';
import './topBanner.scss'
import Banner from "../../Assets/Images/ukraine-flag.jpg";
import {Button, Input} from "antd";
import { useNavigate } from 'react-router-dom';

const TopBanner = ({input}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <div className="bannerImg">
            <div className="bannerTitle">
                <h1>Спільнота взаємодопомоги</h1>
                <h2>«Обмінюй з користю»</h2>
            </div>
            <h1></h1>
            <img src={Banner} alt="Banner"/>

            {input ?
                <div className="inputBlock">
                    <div className="inputLine">
                        <Input
                            placeholder="Пошук"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <Button
                            type="primary"
                            onClick={handleSearch}
                        >
                            Знайти
                        </Button>
                    </div>
                </div>
                :
                <></>
            }
        </div>
    );
};

export default TopBanner;