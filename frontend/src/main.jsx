import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import {ConfigProvider} from "antd";
import './Styles/index.scss'
import {AuthProvider} from "./Components/AuthContext/AuthContext.jsx";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#2ecd76',
                    colorLink: '#2ecd76',
                    colorSuccess: '#2ecd76',
                },
            }}
        >
            <AuthProvider>
                <App />
            </AuthProvider>
        </ConfigProvider>
    </BrowserRouter>
);