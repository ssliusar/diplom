import React, { useEffect, useState } from 'react';
import { Button, Image, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './itemPage.scss';

const ItemPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${import.meta.env.VITE_API}/catalog/getItem/${id}`);
                setItem(data);
                setError(null);
            } catch (err) {
                console.error('Помилка при завантаженні товару:', err);
                setError('Не вдалося завантажити інформацію про товар');
                message.error('Не вдалося завантажити інформацію про товар');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchItem();
        }
    }, [id]);


    const handleBookItem = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API}/booking/book`,
                {id},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            message.success('Успішно заброньовано');

            const { data } = await axios.get(`${import.meta.env.VITE_API}/catalog/getItem/${id}`);
            setItem(data);

        } catch (err) {
            console.error('Помилка при бронюванні:', err);

            if (err.response && err.response.data && err.response.data.message) {
                message.error(err.response.data.message);
            } else {
                message.error('Не вдалося забронювати товар');
            }
        }
    };

    const goToHome = () => {
        navigate('/');
    };

    const goToCatalog = () => {
        navigate('/catalog');
    };

    if (loading) {
        return (
            <div className='wrapper'>
                <div className="loading-container">
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className='wrapper'>
                <div className="error-container">
                    <h2>Помилка завантаження</h2>
                    <p>{error || 'Товар не знайдено'}</p>
                    <Button type="primary" onClick={goToCatalog}>
                        Повернутись до каталогу
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='wrapper'>
            <div className="itemDescription">
                <h4>{item.title}
                    <div className='option'>
                        <p className='condition'>Стан: 5/5</p>
                        <p className='category'>{item.categoryName}</p>
                    </div>
                </h4>
                <div className="imageList">
                    <Image.PreviewGroup>
                        {item.images.map((image, index) => (
                            <Image
                                key={index}
                                width={200}
                                src={`${import.meta.env.VITE_API}${image}`}
                                alt={`${item.title} - зображення ${index + 1}`}
                            />
                        ))}
                    </Image.PreviewGroup>
                </div>
                <p>{item.description}</p>

                <div className="triggers">
                    {!item.isBooked ? (
                        <Button type='primary' onClick={handleBookItem}>Забронювати</Button>
                    ) : (
                        <Button type='primary' disabled>
                            Заброньовано до {new Date(item.bookedUntil).toLocaleDateString()}
                        </Button>
                    )}
                </div>

                <div className="links">
                    <Button type='link' onClick={goToHome}>Головна сторінка</Button>
                    <Button type='link' onClick={goToCatalog}>Повернутись до каталогу</Button>
                </div>
            </div>
        </div>
    );
};

export default ItemPage;