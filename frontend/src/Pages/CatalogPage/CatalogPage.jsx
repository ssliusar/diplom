import React, { useEffect, useState } from 'react';
import { Button, Card, Input, List, message, Spin, Empty, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
const { Meta } = Card;
import './catalogPage.scss';
import axios from "axios";
import { useLocation, useNavigate } from 'react-router-dom';

const CatalogPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const searchFromURL = queryParams.get('search') || '';
    const categoryFromURL = queryParams.get('categoryId') ? Number(queryParams.get('categoryId')) : null;

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState(searchFromURL);
    const [selectedCategory, setSelectedCategory] = useState(categoryFromURL);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const limit = 12;

    const loadCategories = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/catalog/getCategories`);
            setCategories(data);
        } catch (error) {
            console.error('Помилка при завантаженні категорій:', error);
            message.error('Не вдалося завантажити категорії');
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        const newSearchTerm = queryParams.get('search') || '';
        const newCategoryId = queryParams.get('categoryId') ? Number(queryParams.get('categoryId')) : null;

        setSearchTerm(newSearchTerm);
        setSelectedCategory(newCategoryId);
        setItems([]);
        setCurrentPage(0);

        const timer = setTimeout(() => {
            setLoading(true);
            axios.get(`${import.meta.env.VITE_API}/catalog/getCatalog`, {
                params: {
                    search: newSearchTerm,
                    categoryId: newCategoryId,
                    limit: limit,
                    offset: 0
                }
            }).then(({ data }) => {
                setItems(data.items);
                setTotal(data.total);
                setHasMore(data.items.length >= limit && data.hasMore);
                setCurrentPage(1);
            }).catch(error => {
                console.error('Помилка при завантаженні каталогу:', error);
                message.error('Не вдалося завантажити дані каталогу');
            }).finally(() => {
                setLoading(false);
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [location.search, limit]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;

        try {
            setLoadingMore(true);

            const offset = currentPage * limit;

            const { data } = await axios.get(`${import.meta.env.VITE_API}/catalog/getCatalog`, {
                params: {
                    search: searchTerm,
                    categoryId: selectedCategory,
                    limit: limit,
                    offset: offset
                }
            });

            const existingIds = new Set(items.map(item => item.id));
            const newItems = data.items.filter(item => !existingIds.has(item.id));

            console.log(`Нові унікальні елементи: ${newItems.length}`);

            setItems(prevItems => [...prevItems, ...newItems]);
            setHasMore(data.hasMore);
            setCurrentPage(prevPage => prevPage + 1);
        } catch (error) {
            console.error('Помилка при завантаженні додаткових елементів:', error);
            message.error('Не вдалося завантажити додаткові дані');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleCategoryClick = (categoryId) => {
        const newCategoryId = categoryId === selectedCategory ? null : categoryId;

        const params = new URLSearchParams(location.search);
        if (newCategoryId) {
            params.set('categoryId', newCategoryId);
        } else {
            params.delete('categoryId');
        }
        navigate(`?${params.toString()}`);
    };

    const handleSearch = () => {
        const params = new URLSearchParams(location.search);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        navigate(`?${params.toString()}`);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className='wrapper'>
            <div className="catalogPage">
                <div className="titleContent">
                    <h1>Каталог</h1>
                </div>

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
                            loading={loading}
                        >
                            Знайти
                        </Button>
                    </div>

                    <ul className="popularCategory">
                        {categories.map(category => (
                            <li key={category.id}>
                                <Button
                                    type={selectedCategory === category.id ? 'primary' : 'dashed'}
                                    onClick={() => handleCategoryClick(category.id)}
                                >
                                    {category.title}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
                {total > 0 && (
                    <div className='amount'>
                        <Tag color="#2ecd76">Знайдено товарів: {total}</Tag>
                    </div>
                )}
                <div className="list">
                    {loading ? (
                        <div className="loading-container">
                            <Spin size="large" />
                        </div>
                    ) : (
                        <>
                            {items.length === 0 ? (
                                <Empty description="За вашим запитом нічого не знайдено" />
                            ) : (
                                <List
                                    grid={{
                                        gutter: 16,
                                        xs: 1,
                                        sm: 2,
                                        md: 3,
                                        lg: 4,
                                        xl: 4,
                                        xxl: 4,
                                    }}
                                    itemLayout="horizontal"
                                    size="small"
                                    dataSource={items}
                                    locale={{emptyText: "Каталог пустий"}}
                                    renderItem={(item) => (
                                        <List.Item key={item.id}>
                                            <Card
                                                className='listItem'
                                                style={{
                                                    width: '100%',
                                                }}
                                                cover={
                                                    <img
                                                        alt={item.title}
                                                        src={`${import.meta.env.VITE_API}${item.image[0]}`}
                                                    />
                                                }
                                                actions={[
                                                    <Button
                                                        type="primary"
                                                        href={`/catalog/item/${item.id}`}
                                                    >
                                                        <EyeOutlined /> Детальніше
                                                    </Button>,
                                                ]}
                                            >
                                                <Meta
                                                    title={item.title}
                                                    description={
                                                        <>
                                                            <p className='category'>{item?.category}</p>
                                                            <p>Стан: {item?.condition}/5</p>
                                                        </>
                                                    }
                                                />
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            )}

                            {hasMore && (
                                <div className="load-more">
                                    <Button
                                        type="primary"
                                        onClick={handleLoadMore}
                                        loading={loadingMore}
                                        disabled={!hasMore || loadingMore}
                                    >
                                        Завантажити ще
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;