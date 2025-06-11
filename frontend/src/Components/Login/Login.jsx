import React from 'react';
import {Button, Form, Input, message} from "antd";
import DOMPurify from 'dompurify';
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [loginForm] = Form.useForm();
    const navigate = useNavigate();

    const SubmitForm = async (values) => {
        try {

            const checkEmail = typeof values.email === 'string' ? DOMPurify.sanitize(values.email) : values.email
            const {data} = await axios.post(`${import.meta.env.VITE_API}/auth/login`, {
                email: checkEmail,
                password: values.password
            });

            if (data?.token) {
                localStorage.setItem('user', JSON.stringify(data?.user));
                localStorage.setItem('token', data.token);

                message.success('Ви успішно авторизовані!');
                if(data?.user?.type === 'user')
                    return navigate('/panel');
                else if(data?.user?.type === 'manager')
                    return navigate('/manager');
                else if(data?.user?.type === 'admin')
                    return navigate('/admin');
            }
        } catch (error) {
            console.error('Помилка авторизації:', error);
        }
    };

    return (
        <div style={{maxWidth:'400px', margin:'40px auto 0'}}>
            <Form
                form={loginForm}
                name="login"
                layout="vertical"
                onFinish={SubmitForm}
                autoComplete="off"
            >
                <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Електронна пошта</h4>

                <Form.Item
                    name="email"
                    style={{width: '100%', height: '50px', marginBottom: '30px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Введіть електронну пошту!',
                        },
                        {
                            type: 'email',
                            message: 'Електронну пошта введена некоректно!',
                        }
                    ]}
                >
                    <Input style={{width: '100%', borderColor:'#2ecd76', height: '50px'}} />
                </Form.Item>

                <h4 style={{fontSize: '16px', marginBottom: '8px'}}>Пароль</h4>

                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Введіть ваш пароль!',
                        },
                    ]}
                >
                    <Input.Password style={{width: '100%', borderColor:'#2ecd76', height: '50px'}} />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        className='submit'
                        htmlType="submit"
                        block
                    >
                        Авторизуватись
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;