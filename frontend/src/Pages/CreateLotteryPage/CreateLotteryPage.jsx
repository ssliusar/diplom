import React, { useState } from 'react';
import './createLotteryPage.scss';
import { Button, DatePicker, Form, Input, InputNumber, Upload, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const { TextArea } = Input;

const CreateLotteryPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const navigate = useNavigate();

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Ви можете завантажувати тільки JPG/PNG файли!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Зображення повинно бути менше 2MB!');
            return false;
        }

        setImageFile(file);
        return false;
    };

    const fileList = imageFile ? [
        {
            uid: '-1',
            name: imageFile.name,
            status: 'done',
            url: URL.createObjectURL(imageFile),
        },
    ] : [];

    const handleRemove = () => {
        setImageFile(null);
    };

    const submitForm = async (values) => {
        if (!imageFile) {
            message.error('Будь ласка, завантажте зображення!');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('date', values.date.format('YYYY-MM-DD'));
            formData.append('price', values.price);

            const response = await axios.post(`${import.meta.env.VITE_API}/lottery/create`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.status === 201) {
                message.success('Розіграш успішно створено!');
                navigate('/admin');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Помилка при створенні розіграшу';
            message.error(errorMessage);
            console.error('Create lottery error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='wrapper'>
            <div className="createBooking">
                <div className="titleContent">
                    <h1>Створити розіграш</h1>
                </div>

                <div className="createLine">
                    <Form
                        form={form}
                        name="createLottery"
                        layout="vertical"
                        onFinish={submitForm}
                        autoComplete="off"
                    >
                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Назва розіграшу</h4>
                        <Form.Item
                            name="title"
                            style={{width: '100%', height: '50px', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, введіть назву розіграшу!',
                                }
                            ]}
                        >
                            <Input style={{width: '100%', borderColor: '#2ecd76', height: '50px'}}/>
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Опис розіграшу</h4>
                        <Form.Item
                            name="description"
                            style={{width: '100%', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, введіть опис розіграшу!',
                                }
                            ]}
                        >
                            <TextArea rows={4} maxLength={2000}/>
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Дата розіграшу</h4>
                        <Form.Item
                            name="date"
                            style={{width: '100%', height: '50px', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, оберіть дату розіграшу!',
                                },
                                {
                                    validator: (_, value) => {
                                        if (value && value.isBefore(new Date(), 'day')) {
                                            return Promise.reject('Дата не може бути в минулому!');
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <DatePicker
                                className="datepicker"
                                placeholder=""
                                format="DD.MM.YYYY"
                                style={{width: '100%', height: '50px'}}
                            />
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Вартість одного білету</h4>
                        <Form.Item
                            name="price"
                            style={{width: '100%', height: '50px', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, введіть вартість білету!',
                                },
                                {
                                    type: 'number',
                                    min: 1,
                                    message: 'Вартість повинна бути більше 0!',
                                }
                            ]}
                        >
                            <InputNumber
                                style={{width: '100%', borderColor: '#2ecd76'}}
                                min={1}
                            />
                        </Form.Item>

                        <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Зображення розіграшу</h4>
                        <Form.Item
                            name="image"
                            style={{width: '100%', marginBottom: '30px'}}
                            rules={[
                                {
                                    required: true,
                                    message: 'Будь ласка, завантажте зображення!',
                                }
                            ]}
                        >
                            <Upload
                                listType="picture"
                                fileList={fileList}
                                beforeUpload={beforeUpload}
                                onRemove={handleRemove}
                                maxCount={1}
                            >
                                <Button icon={<UploadOutlined />} style={{height: '40px'}}>
                                    Завантажити зображення
                                </Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                className='submit'
                                htmlType="submit"
                                loading={loading}
                                style={{height: '50px', fontSize: '18px'}}
                                block
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

export default CreateLotteryPage;