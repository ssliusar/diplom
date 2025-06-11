import React, { useState, useEffect } from 'react';
import './manageLotteryPage.scss';
import { Button, Card, List, message, Modal, Spin } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Meta } = Card;

const ManageLotteryPage = () => {
    const [lotteries, setLotteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState({ lotteryId: null, action: null });
    const navigate = useNavigate();

    useEffect(() => {
        fetchLotteries();
    }, []);

    const fetchLotteries = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API}/lottery/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                setLotteries(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching lotteries:', error);
            message.error('Помилка при завантаженні розіграшів');
        } finally {
            setLoading(false);
        }
    };

    const showConfirmModal = (lotteryId, action) => {
        setModalAction({ lotteryId, action });
        setConfirmModalVisible(true);
    };

    const handlePrizeStatus = async () => {
        try {
            setLoading(true);
            const { lotteryId, action } = modalAction;

            const response = await axios.put(
                `${import.meta.env.VITE_API}/lottery/update-lottery-status/${lotteryId}`,
                {
                    give: action === 'received',
                    archive: action === 'notReceived'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                message.success(
                    action === 'received'
                        ? 'Статус змінено: приз отримано'
                        : 'Статус змінено: приз не отримано'
                );
                fetchLotteries(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating prize status:', error);
            message.error('Помилка при оновленні статусу призу');
        } finally {
            setLoading(false);
            setConfirmModalVisible(false);
        }
    };

    const viewLotteryDetails = (id) => {
        navigate(`/lottery/${id}`);
    };

    const renderCardActions = (lottery) => {
        if (lottery.winner_user_id && !lottery.give && !lottery.archive) {
            return [
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <Button
                        type='primary'
                        onClick={() => showConfirmModal(lottery.id, 'received')}
                    >
                        Приз отримано
                    </Button>
                    <Button
                        type='default'
                        danger
                        onClick={() => showConfirmModal(lottery.id, 'notReceived')}
                    >
                        Приз не отримано
                    </Button>
                </div>
            ];
        }

        if (lottery.give || lottery.archive) {
            return [
                <p style={{
                    textAlign: 'center',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: lottery.give ? '#2ecd76' : '#ff4d4f'
                }}>
                    {lottery.give ? 'Приз отримано' : 'Приз не отримано'}
                </p>
            ];
        }

        return [
            <p style={{
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: '800',
                color: '#2ecd76'
            }}>
                {moment(lottery.date).isAfter(moment()) ? 'Активний' : 'Очікує розіграшу'}
            </p>
        ];
    };

    const renderWinnerInfo = (lottery) => {
        if (lottery.winner_user_id && lottery.user) {
            return (
                <>
                    <p className='date'>Переможець: {lottery.user.username}</p>
                    <p className='date'>Номер телефону: {lottery.user.phoneNumber}</p>
                    <p className='date'>Пошта: {lottery.user.email}</p>
                </>
            );
        } else {
            return (
                <>
                    <p className='date'>Переможець: Не обрано</p>
                    <p className='date'>Номер телефону: Не обрано</p>
                    <p className='date'>Пошта: Не обрано</p>
                </>
            );
        }
    };

    return (
        <div className='wrapper'>
            <div className="manageLottery">
                <div className="titleContent">
                    <h1>Розіграші</h1>
                </div>

                <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:'16px'}}>
                    <Button style={{color:'#fff'}} type='primary' href={'/createlottery'}>Створити</Button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', margin: '50px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <div className="lotteryList">
                        <div className="list">
                            <List
                                grid={{
                                    gutter: 16,
                                    xs: 1,
                                    sm: 2,
                                    md: 3,
                                    lg: 4,
                                    xl: 4,
                                    xxl: 4
                                }}
                                itemLayout="horizontal"
                                size="small"
                                dataSource={lotteries}
                                locale={{emptyText: "Розіграші відсутні"}}
                                renderItem={(lottery) => (
                                    <List.Item>
                                        <Card
                                            className='listItem'
                                            style={{
                                                width: '100%',
                                                margin: '10px 0'
                                            }}
                                            cover={
                                                <img
                                                    src={`${import.meta.env.VITE_API}${lottery.image}`}
                                                    alt={lottery.title}
                                                />
                                            }
                                            actions={renderCardActions(lottery)}
                                        >
                                            <Meta
                                                title={
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <span>{lottery.title}</span>
                                                        <Button
                                                            type='primary'
                                                            size={'small'}
                                                            onClick={() => viewLotteryDetails(lottery.id)}
                                                        >
                                                            <EyeOutlined />
                                                        </Button>
                                                    </div>
                                                }
                                                description={
                                                    <>
                                                        <p className='date'>
                                                            Дата розіграшу: {moment(lottery.date).format('DD.MM.YYYY')}
                                                        </p>
                                                        {renderWinnerInfo(lottery)}
                                                    </>
                                                }
                                            />
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>

            <Modal
                title="Підтвердження"
                open={confirmModalVisible}
                onOk={handlePrizeStatus}
                onCancel={() => setConfirmModalVisible(false)}
                okText="Підтвердити"
                cancelText="Скасувати"
            >
                <p>
                    {modalAction.action === 'received'
                        ? 'Ви впевнені, що хочете позначити приз як отриманий?'
                        : 'Ви впевнені, що хочете позначити приз як не отриманий?'}
                </p>
            </Modal>
        </div>
    );
};

export default ManageLotteryPage;