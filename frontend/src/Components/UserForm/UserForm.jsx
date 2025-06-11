import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message } from "antd";
import axios from 'axios';

const UserForm = () => {
    const [userForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    message.error('Ви не авторизовані');
                    return;
                }

                const {data} = await axios.get(`${import.meta.env.VITE_API}/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const userData = data.user;

                userForm.setFieldsValue({
                    username: userData.username,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    password: ''
                });

            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Помилка при отриманні даних користувача';
                message.error(errorMessage);
            }
        };

        fetchUserData();
    }, [userForm]);


    const SubmitForm = async (values) => {
        try {
            setLoading(true);

            const token = localStorage.getItem('token');

            if (!token) {
                message.error('Ви не авторизовані');
                setLoading(false);
                return;
            }

            const response = await axios.put(`${import.meta.env.VITE_API}/user/profile`, values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });


            if (response.data.success) {
                message.success('Дані успішно оновлено');

                if (values.password) {
                    userForm.setFieldsValue({
                        password: ''
                    });
                }
            }

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Помилка при оновленні даних';
            message.error(errorMessage);
            console.error('Update user data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const validatePhone = (_, value) => {
        if (!value) {
            return Promise.reject('Будь ласка, введіть номер телефону');
        }

        const phonePattern = /^\+?\d{10,15}$/;

        if (!phonePattern.test(value)) {
            return Promise.reject('Введіть коректний номер телефону');
        }

        return Promise.resolve();
    };

    const validatePassword = (_, value) => {
        if (value && value.length < 8) {
            return Promise.reject('Пароль повинен бути не менше 8 символів');
        }

        return Promise.resolve();
    };

    return (
        <div style={{margin: '40px auto 0'}}>
            <Form
                form={userForm}
                name="register"
                layout="vertical"
                style={{width:'100%', display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gridTemplateRows:'repeat(2, 1fr)', gridColumnGap:'20px'}}
                onFinish={SubmitForm}
                autoComplete="off"
                scrollToFirstError
            >
                <div>
                    <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Ім'я</h4>
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Введіть ваше Ім`я!',
                            },
                        ]}
                    >
                        <Input style={{width: '100%', height: '50px'}}/>
                    </Form.Item>
                </div>
                <div>
                    <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Електронна пошта</h4>
                    <Form.Item
                        name="email"
                        style={{width: '100%', height: '50px'}}
                        rules={[
                            {
                                required: true,
                                message: 'Введіть вашу електронну пошту!',
                            },
                            {
                                type: 'email',
                                message: 'Введіть коректну електронну пошту!',
                            }
                        ]}
                    >
                        <Input style={{width: '100%', height: '50px'}}/>
                    </Form.Item>
                </div>
                <div>
                    <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Номер телефону</h4>
                    <Form.Item
                        name="phoneNumber"
                        rules={[
                            {
                                required: true,
                                validator: validatePhone,
                            },
                        ]}
                    >
                        <Input style={{width: '100%', height: '50px'}}/>
                    </Form.Item>
                </div>
                <div>
                    <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Пароль</h4>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                validator: validatePassword,
                            },
                        ]}
                        help="Якщо не бажаєте змінювати пароль, залиште поле порожнім"
                    >
                        <Input.Password style={{width: '100%', height: '50px'}}/>
                    </Form.Item>
                </div>
                <div style={{gridArea:'3 / 1 / 4 / 3'}}>
                    <Form.Item>
                        <Button
                            type="primary"
                            className='submit'
                            htmlType="submit"
                            style={{fontWeight:'800',fontSize:'18px',height:'50px'}}
                            loading={loading}
                            block
                        >
                            Оновити
                        </Button>
                    </Form.Item>
                </div>
            </Form>
        </div>
    );
};

export default UserForm;