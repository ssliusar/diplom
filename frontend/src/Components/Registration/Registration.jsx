import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message} from "antd";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";

const Login = () => {
    const [regForm] = Form.useForm();
    const navigate = useNavigate();

    const [isUser, setUser] = useState({isValid:false})
    const getUserData = async () => {
        const userData = localStorage.getItem('token');

        if (userData) {
            const {data} = await axios.get(`${import.meta.env.VITE_API}/auth/user_verify`, {
                headers: {
                    Authorization: `Bearer ${userData}`
                }
            });

            if(data)
                setUser(data)
        }
    }

    useEffect(() => {
        getUserData()
    }, []);
    const validatePassword = (_, value) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!value) {
            return Promise.reject('Введіть пароль');
        }
        if (!regex.test(value)) {
            return Promise.reject(
                'Пароль повинен містити 8 або більше символів (великі, малі літери та цифри)'
            );
        }
        return Promise.resolve();
    };

    const validatePhone = (_, value) => {
        const regex = /^\+?[0-9]{10,15}$/;
        if (!value) {
            return Promise.reject('Введіть номер телефону');
        }
        if (!regex.test(value)) {
            return Promise.reject('Введіть коректний номер телефону');
        }
        return Promise.resolve();
    };

    const SubmitForm = async (values) => {
        try {

            const checkEmail = typeof values.email === 'string' ? DOMPurify.sanitize(values.email) : values.email

            const {data} = await axios.post(`${import.meta.env.VITE_API}/auth/register`, {
                email: checkEmail,
                phoneNumber: values.phoneNumber,
                username: values?.username,
                password: values.password
            });

            if (data.token) {
                localStorage.setItem('user', JSON.stringify(data?.currentUser));
                localStorage.setItem('token', data.token);

                message.success('Ви успішно авторизовані!');

                if(isUser?.isValid && isUser?.type === 'user')
                    navigate('/panel');
                else if(isUser?.isValid && isUser?.type === 'manager')
                    navigate('/manager');
                else if(isUser?.isValid && isUser?.type === 'admin')
                    navigate('/admin');

            }
        } catch (error) {
            console.error('Помилка реєстрації:', error);
        }
    };

    return (
        <div style={{maxWidth: '400px', margin: '40px auto 0'}}>
            <Form
                form={regForm}
                name="register"
                layout="vertical"
                onFinish={SubmitForm}
                autoComplete="off"
                scrollToFirstError
            >
                <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Ім'я</h4>
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Введіть коректне ім`я користувача!',
                        },
                    ]}
                >
                    <Input style={{width: '100%', height: '50px'}}/>
                </Form.Item>
                <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Електронна пошта</h4>
                <Form.Item
                    name="email"
                    style={{width: '100%', height: '50px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Введіть електронну пошту!',
                        },
                        {
                            type: 'email',
                            message: 'Введіть коректну електронну пошту!',
                        }
                    ]}
                >
                    <Input style={{width: '100%', height: '50px'}}/>
                </Form.Item>
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
                <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Пароль</h4>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            validator: validatePassword,
                        },
                    ]}
                >
                    <Input.Password style={{width: '100%', height: '50px'}}/>
                </Form.Item>
                <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Повторіть пароль</h4>
                <Form.Item
                    name="password_confirm"
                    dependencies={['password']}
                    rules={[
                        {
                            required: true,
                            message: 'Повторіть ваш пароль!',
                        },
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject('Паролі не співпадають!');
                            },
                        }),
                    ]}
                >
                    <Input.Password style={{width: '100%', height: '50px'}}/>
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        className='submit'
                        htmlType="submit"
                        block
                    >
                        Зареєструватись
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;