import React, {useEffect, useState} from 'react';
import {Button, Card, List, message} from "antd";
import {EyeOutlined} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
const { Meta } = Card;
import './userReserved.scss'

const UserReserved = () => {

    const [isData, setData] = useState([])

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                message.error('Ви не авторизовані');
                return;
            }

            const {data} = await axios.get(`${import.meta.env.VITE_API}/user/user-bookings`, {
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

    const handleCancelBooking = async (id) => {
        try {

            const {data} = await axios.post(
                `${import.meta.env.VITE_API}/booking/cancel`,
                {id},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if(data?.success)
                message.success(data?.message);
            else
                message.warning(data?.message);

            fetchUserData()

        } catch (err) {
            console.error('Помилка при скасуванні бронювання:', err);
            message.error('Не вдалося скасувати бронювання');
        }
    };


    return (
        <List
            grid={{column: 4}}
            itemLayout="horizontal"
            size="small"
            dataSource={isData}
            className='userReservedInfo'
            locale={{emptyText: "Бронювання відсутні"}}
            renderItem={(item, index) => (
                <List.Item key={index}>
                    <Card
                        className='listItem'
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
                            <Button className='linkButton' href={`/catalog/item/${item?.id}`} type='primary'><EyeOutlined key="edit"/>Детальніше</Button>,
                            <Button onClick={()=>handleCancelBooking(item?.id)} type='default' danger>Відмінити</Button>
                        ]}
                    >
                        <Meta
                            title={item?.name}
                            description={<>
                                <p className='date'>Дійсне до: {dayjs(item?.booked_end_date).format('DD.MM.YYYY')}</p>
                            </>}
                        />
                    </Card>
                </List.Item>
            )}
        />
    );
};

export default UserReserved;