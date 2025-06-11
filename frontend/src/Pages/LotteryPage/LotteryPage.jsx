import React, { useState, useEffect } from 'react';
import { Button, List, Modal, InputNumber, message } from "antd";
import { ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import './lotteryPage.scss';

const LotteryPage = () => {
    const [lotteries, setLotteries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buyModalVisible, setBuyModalVisible] = useState(false);
    const [selectedLottery, setSelectedLottery] = useState(null);
    const [ticketQuantity, setTicketQuantity] = useState(1);

    useEffect(() => {
        fetchActiveLotteries();
    }, []);

    const fetchActiveLotteries = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const response = await axios.get(`${import.meta.env.VITE_API}/lottery/getWaitLottery`,{headers: { Authorization: `Bearer ${token}` }});
            if (response.data.success) {
                setLotteries(response.data.data);
            } else {
                message.error('Не вдалося завантажити розіграші');
            }
        } catch (error) {
            console.error('Error fetching lotteries:', error);
            message.error('Помилка при завантаженні розіграшів');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyClick = (lottery) => {
        setSelectedLottery(lottery);
        setTicketQuantity(1);
        setBuyModalVisible(true);
    };

    const handleBuyTickets = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(`${import.meta.env.VITE_API}/lottery/buy/${selectedLottery.id}`, {
                quantity: ticketQuantity
            },{headers: { Authorization: `Bearer ${token}` }});

            if (response.data.success) {
                message.success(response.data.message);
                setBuyModalVisible(false);
                fetchActiveLotteries();
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            console.error('Error buying tickets:', error);
            if (error.response && error.response.data) {
                message.error(error.response.data.message);
            } else {
                message.error('Помилка при покупці білетів');
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="wrapper">
            <div className='lotteryContent'>
                <h1>Список активних розіграшів</h1>
                <div className="catalog">
                    <div className="list">
                        <List
                            itemLayout="vertical"
                            size="large"
                            loading={loading}
                            pagination={{
                                onChange: (page) => {
                                    console.log(page);
                                    window.scrollTo(0, 0);
                                },
                                pageSize: 5,
                            }}
                            dataSource={lotteries}
                            renderItem={(item) => (
                                <List.Item
                                    key={item.id}
                                    className='listItem'
                                    actions={[
                                        <div className='lotteryTrigger'>
                                            <p>Дата розіграшу: {formatDate(item.date)}</p>
                                            <p>Ваші білети: {item.userTicketCount}</p>
                                            <p>Вартість білету: {item.price} балів</p>
                                            <Button
                                                type="primary"
                                                onClick={() => handleBuyClick(item)}
                                            >
                                                <ShoppingCartOutlined /> Купити білет
                                            </Button>
                                        </div>
                                    ]}
                                >
                                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                                        <img
                                            width={400}
                                            alt={item.title}
                                            src={`${import.meta.env.VITE_API}${item.image}`}
                                            style={{ marginRight: 20 }}
                                        />
                                        <div>
                                            <List.Item.Meta
                                                title={<a href={`/lottery/${item.id}`}>{item.title}</a>}
                                            />
                                            {item.description}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>

            <Modal
                title="Купити білети"
                open={buyModalVisible}
                onCancel={() => setBuyModalVisible(false)}
                onOk={handleBuyTickets}
                okText="Купити"
                cancelText="Скасувати"
            >
                {selectedLottery && (
                    <div>
                        <h3>{selectedLottery.title}</h3>
                        <p>Вартість одного білету: {selectedLottery.price} балів</p>
                        <div style={{ marginBottom: 16 }}>
                            <label>Кількість білетів:</label>
                            <InputNumber
                                min={1}
                                value={ticketQuantity}
                                onChange={setTicketQuantity}
                                style={{ width: 120, marginLeft: 16 }}
                            />
                        </div>
                        <p><strong>Загальна вартість: {selectedLottery.price * ticketQuantity} балів</strong></p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default LotteryPage;