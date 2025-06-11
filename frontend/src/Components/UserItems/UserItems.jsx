import React, {useEffect, useState} from 'react';
import {Button, Card, List, message} from "antd";
import {EyeOutlined} from "@ant-design/icons";
import axios from "axios";
const { Meta } = Card;
import './userItems.scss'

const UserItems = () => {
    const [isData, setData] = useState([])

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    message.error('Ви не авторизовані');
                    return;
                }

                const {data} = await axios.get(`${import.meta.env.VITE_API}/user/my-items`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setData(data);

            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Помилка при отриманні даних користувача';
                message.error(errorMessage);
            }
        };

        fetchUserData();
    }, []);


    return (
        <List
            grid={{column: 4}}
            itemLayout="horizontal"
            size="small"
            dataSource={isData}
            locale={{emptyText: "Список речей пустий"}}
            renderItem={(item, index) => (
                <List.Item key={index}>
                    <Card
                        className='userCatalogItem'
                        style={{
                            width: 300,
                        }}
                        cover={
                            <img
                                alt="example"
                                src={`${import.meta.env.VITE_API}${item?.image[0]}`}
                            />
                        }
                        actions={[
                            <Button style={{width:'100%', maxWidth:'250px', height:'40px'}} href={`/catalog/item/${item?.id}`} type='primary'><EyeOutlined key="edit"/>Детальніше</Button>
                        ]}
                    >
                        <Meta
                            style={{textAlign:'center'}}
                            title={item?.name}
                        />
                    </Card>
                </List.Item>
            )}
        />
    );
};

export default UserItems;