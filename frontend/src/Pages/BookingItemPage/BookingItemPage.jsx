import React, { useState } from 'react';
import './bookingPage.scss';
import { Button, Card, Input, List, message, Modal, Spin } from "antd";
import { EyeOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import axios from 'axios';

const { Meta } = Card;
const { confirm } = Modal;

const BookingItemPage = () => {
    const [loading, setLoading] = useState(false);
    const [searchPhone, setSearchPhone] = useState('');
    const [userData, setUserData] = useState(null);
    const [bookedItems, setBookedItems] = useState([]);

    const handleSearch = async () => {
        if (!searchPhone) {
            message.warning('Введіть номер телефону для пошуку');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API}/booking/bookings/by-phone`, {phone:searchPhone},{
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setUserData(response.data.user);
                setBookedItems(response.data.items);

                if (response.data.items.length === 0) {
                    message.info('У користувача немає заброньованих речей');
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Помилка при пошуку';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmTransfer = (itemId) => {
        confirm({
            title: 'Підтвердити передачу речі?',
            icon: <ExclamationCircleOutlined />,
            content: 'Власнику речі будуть зараховані бали, а річ буде архівована.',
            okText: 'Так',
            cancelText: 'Ні',
            onOk: async () => {
                try {
                    const response = await axios.post(`${import.meta.env.VITE_API}/booking/bookings/confirm`,
                        { itemId },
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );

                    if (response.data.success) {
                        message.success(response.data.message);
                        setBookedItems(bookedItems.filter(item => item.id !== itemId));
                    }
                } catch (error) {
                    const errorMsg = error.response?.data?.message || 'Помилка при підтвердженні передачі';
                    message.error(errorMsg);
                }
            }
        });
    };

    const handleCancelBooking = (itemId) => {
        confirm({
            title: 'Скасувати бронювання?',
            icon: <ExclamationCircleOutlined />,
            content: 'Річ повернеться в доступні для інших користувачів.',
            okText: 'Так',
            cancelText: 'Ні',
            onOk: async () => {
                try {
                    const response = await axios.post(`${import.meta.env.VITE_API}/booking/bookings/cancel-by-manager`,
                        { itemId },
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );

                    if (response.data.success) {
                        message.success(response.data.message);
                        setBookedItems(bookedItems.filter(item => item.id !== itemId));
                    }
                } catch (error) {
                    const errorMsg = error.response?.data?.message || 'Помилка при скасуванні бронювання';
                    message.error(errorMsg);
                }
            }
        });
    };

    const handleViewDetails = (item) => {
        Modal.info({
            title: item.name,
            content: (
                <div>
                    <p><strong>Опис:</strong> {item.description}</p>
                    <p><strong>Категорія:</strong> {item.category}</p>
                    <p><strong>Стан:</strong> {item.condition}/5</p>
                    <p><strong>Бали:</strong> {item.points}</p>
                    <p><strong>Власник:</strong> {item.owner?.username} ({item.owner?.phoneNumber})</p>
                    <p><strong>Бронювання дійсне до:</strong> {new Date(item.booked_end_date).toLocaleDateString('uk-UA')}</p>
                </div>
            ),
            okText: 'Закрити',
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Не вказано';
        return new Date(dateString).toLocaleDateString('uk-UA');
    };

    return (
        <div className='wrapper'>
            <div className="booking">
                <div className="titleContent">
                    <h1>Перегляд бронювання</h1>
                    <div className="inputLine">
                        <Input
                            placeholder={'Введіть номер телефону користувача'}
                            value={searchPhone}
                            onChange={(e) => setSearchPhone(e.target.value)}
                            onPressEnter={handleSearch}
                        />
                        <Button
                            type='primary'
                            onClick={handleSearch}
                            loading={loading}
                        >
                            Шукати
                        </Button>
                    </div>
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '16px'}}>
                        <Button style={{color: '#fff'}} type='primary' href={'/createbooking'}>Створити нову річ</Button>
                    </div>
                </div>

                {loading ? (
                    <div style={{textAlign: 'center', margin: '50px 0'}}>
                        <Spin size="large"/>
                    </div>
                ) : userData ? (
                    <div className="findUser">
                        <p>Бронювання належить користувачу: <strong>{userData.name}</strong> ({userData.phone})</p>
                        <div className="list">
                            <List
                                grid={{ column: 4, gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                                itemLayout="horizontal"
                                size="small"
                                dataSource={bookedItems}
                                locale={{emptyText: "Бронювання відсутні"}}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Card
                                            className='listItem'
                                            style={{
                                                width: 300,
                                                margin: '10px 0'
                                            }}
                                            cover={
                                                <img
                                                    alt={item.name}
                                                    src={`${import.meta.env.VITE_API}${item.image[0]}` || 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'}
                                                    style={{ height: 200, objectFit: 'cover' }}
                                                />
                                            }
                                            actions={[
                                                <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                                                    <Button
                                                        type='primary'
                                                        onClick={() => handleViewDetails(item)}
                                                    >
                                                        <EyeOutlined key="view" />
                                                    </Button>
                                                    <Button
                                                        type='default'
                                                        onClick={() => handleConfirmTransfer(item.id)}
                                                    >
                                                        Підтвердити
                                                    </Button>
                                                    <Button
                                                        type='default'
                                                        danger
                                                        onClick={() => handleCancelBooking(item.id)}
                                                    >
                                                        Відмінити
                                                    </Button>
                                                </div>
                                            ]}
                                        >
                                            <Meta
                                                title={item.name}
                                                description={<>
                                                    <p className='category'>{item.category || 'Без категорії'}</p>
                                                    <p className='date'>Дійсний до: {formatDate(item.booked_end_date)}</p>
                                                    <p className='points'>Бали: {item.points}</p>
                                                </>}
                                            />
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default BookingItemPage;