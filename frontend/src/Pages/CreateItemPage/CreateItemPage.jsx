import React, { useState, useEffect } from 'react';
import './createItemPage.scss';
import { Button, Form, Input, Select, Upload, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

const CreateItemPage = () => {
    const [itemForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [userExists, setUserExists] = useState(false);
    const [checkingUser, setCheckingUser] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API}/booking/categories`);
                setCategories(response.data.map(category => ({
                    value: category.id,
                    label: category.title
                })));
            } catch (error) {
                console.error('Помилка при отриманні категорій:', error);
                message.error('Не вдалося завантажити категорії');
            }
        };

        fetchCategories();
    }, []);

    const validatePhoneNumber = (_, value) => {
        const phoneRegex = /^\+380\d{9}$/;
        if (!value) {
            return Promise.reject(new Error('Введіть номер телефону'));
        }
        if (!phoneRegex.test(value.trim())) {
            return Promise.reject(new Error('Введіть коректний номер телефону у форматі +380XXXXXXXXX'));
        }
        return Promise.resolve();
    };


    const checkUserByPhone = async () => {
        try {
            setCheckingUser(true);
            const phoneNumber = itemForm.getFieldValue('phone');

            if (!phoneNumber) {
                message.error('Введіть номер телефону для перевірки');
                setCheckingUser(false);
                return;
            }

            const response = await axios.post(`${import.meta.env.VITE_API}/booking/users/check-phone`, {
                phone: phoneNumber
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.exists) {
                setUserExists(true);
                message.success('Користувача знайдено');
            } else {
                setUserExists(false);
                message.error('Користувача не знайдено');
            }
        } catch (error) {
            console.error('Помилка перевірки користувача:', error);
            message.error('Помилка перевірки користувача');
            setUserExists(false);
        } finally {
            setCheckingUser(false);
        }
    };

    const uploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Ви можете завантажувати лише зображення!');
                return Upload.LIST_IGNORE;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Розмір зображення має бути менше 5MB!');
                return Upload.LIST_IGNORE;
            }

            return false;
        },
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
        fileList,
        listType: "picture",
        maxCount: 3
    };

    const submitForm = async (values) => {
        if (!userExists) {
            message.error('Потрібно перевірити користувача перед створенням речі');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            let imageUrls = [];
            if (fileList.length > 0) {
                const uploadResponse = await axios.post(
                    `${import.meta.env.VITE_API}/booking/upload/images`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                imageUrls = uploadResponse.data.urls;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API}/booking/items/create`,
                {
                    name: values.name,
                    description: values.description,
                    category_id: values.category_id,
                    condition: values.condition,
                    points: values.points,
                    phone: values.phone,
                    image: imageUrls.length > 0 ? imageUrls : undefined
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                message.success('Річ успішно створено!');
                itemForm.resetFields();
                setFileList([]);
                setUserExists(false);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Помилка при створенні речі';
            message.error(errorMessage);
            console.error('Помилка створення речі:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='wrapper'>
            <div className="createBooking">
                <div className="titleContent">
                    <h1>Створити річ</h1>
                </div>

                <div className="createLine">
                    <Form
                        form={itemForm}
                        name="createItem"
                        layout="vertical"
                        onFinish={submitForm}
                        autoComplete="off"
                    >
                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Назва речі</h4>
                        <Form.Item
                            name="name"
                            style={{width: '100%', height: '50px', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, введіть назву речі!',
                                }
                            ]}
                        >
                            <Input style={{width: '100%', borderColor: '#2ecd76', height: '50px'}}/>
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Категорія</h4>
                        <Form.Item
                            name="category_id"
                            style={{width: '100%', height: '50px', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, оберіть категорію!',
                                }
                            ]}
                        >
                            <Select
                                placeholder="Виберіть категорію"
                                style={{width: '100%', height: '50px'}}
                                options={categories}
                                loading={categories.length === 0}
                            />
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Стан речі</h4>
                        <Form.Item
                            name="condition"
                            style={{width: '100%', height: '50px', marginBottom: '30px'}}
                            initialValue={5}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, оберіть стан речі!',
                                }
                            ]}
                        >
                            <Select
                                style={{width: '100%', height: '50px'}}
                                options={[
                                    { value: 5, label: '5 - Відмінний' },
                                    { value: 4, label: '4 - Добрий' },
                                    { value: 3, label: '3 - Задовільний' },
                                    { value: 2, label: '2 - Поганий' },
                                    { value: 1, label: '1 - Дуже поганий' }
                                ]}
                            />
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Опис речі</h4>
                        <Form.Item
                            name="description"
                            style={{width: '100%', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, введіть опис речі!',
                                }
                            ]}
                        >
                            <TextArea rows={4} maxLength={2000} />
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Зображення речі</h4>
                        <Form.Item
                            name="images"
                            style={{width: '100%', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: false,
                                    message: 'Будь ласка, завантажте зображення речі!',
                                }
                            ]}
                        >
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>
                                    Завантажити (макс. 3 фото)
                                </Button>
                            </Upload>
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Номер телефону користувача</h4>
                        <div style={{display: 'flex', alignItems: 'flex-start'}}>
                            <Form.Item
                                name="phone"
                                style={{width: '100%', height: '50px', marginBottom: '30px'}}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Будь ласка, введіть номер телефону!',
                                    },
                                    {
                                        validator: validatePhoneNumber
                                    }
                                ]}
                            >
                                <Input
                                    style={{
                                        width: '100%',
                                        borderColor: userExists ? '#2ecd76' : '#d9d9d9',
                                        height: '50px'
                                    }}
                                    placeholder="+380661234567"
                                />
                            </Form.Item>

                            <Button
                                type='primary'
                                style={{height: '50px', marginLeft: '8px'}}
                                onClick={checkUserByPhone}
                                loading={checkingUser}
                            >
                                Перевірити
                            </Button>
                        </div>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Кількість балів</h4>
                        <Form.Item
                            name="points"
                            style={{width: '100%', height: '50px', marginBottom: '30px'}}
                            initialValue={5}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, оберіть кількість балів!',
                                }
                            ]}
                        >
                            <Select
                                style={{width: '100%', height: '50px'}}
                                options={[
                                    { value: 1, label: '1 бал' },
                                    { value: 2, label: '2 бали' },
                                    { value: 3, label: '3 бали' },
                                    { value: 4, label: '4 бали' },
                                    { value: 5, label: '5 балів' },
                                    { value: 10, label: '10 балів' },
                                    { value: 15, label: '15 балів' },
                                    { value: 20, label: '20 балів' }
                                ]}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                className='submit'
                                htmlType="submit"
                                loading={loading}
                                style={{height:'50px', fontSize:'18px'}}
                                block
                                disabled={!userExists}
                            >
                                Створити
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default CreateItemPage;