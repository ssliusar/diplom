import React from 'react';
import './userPage.scss'
import {Tabs} from "antd";
import UserForm from "../../Components/UserForm/UserForm.jsx";
import UserReserved from "../../Components/UserReserved/UserReserved.jsx";
import UserItems from "../../Components/UserItems/UserItems.jsx";

const UserPage = () => {
    const items = [
        {
            key: '1',
            label: 'Особисті дані',
            children: <UserForm/>,
        },
        {
            key: '2',
            label: 'Заброньовані речі',
            children: <UserReserved/>,
        },
        {
            key: '3',
            label: 'Мої речі',
            children: <UserItems/>,
        }
    ];

    return (
        <div className='wrapper'>
            <div className="userCabinet">
                <div className="titleContent">
                    <h1>Особистий кабінет</h1>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '1400px',
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
            </div>
        </div>
    );
};

export default UserPage;