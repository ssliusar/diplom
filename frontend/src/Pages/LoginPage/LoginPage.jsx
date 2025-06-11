import React from 'react';
import {Tabs} from "antd";
import './loginPage.scss';
import Registration from "../../Components/Registration/Registration.jsx";
import Login from "../../Components/Login/Login.jsx";

const LoginPage = () => {
    const items = [
        {
            key: '1',
            label: 'Авторизація',
            children: <Login/>,
        },
        {
            key: '2',
            label: 'Реєстрація',
            children: <Registration/>,
        }
    ];

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            minHeight:'64vh'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
            }}>
                <Tabs
                    className="equal-width-tabs"
                    defaultActiveKey="1"
                    items={items}
                    size={'large'}
                    indicator={{
                        size: (origin) => origin - 40,
                        align: 'center',
                    }}
                    tabBarGutter={0}
                />
            </div>
        </div>
    );
};

export default LoginPage;