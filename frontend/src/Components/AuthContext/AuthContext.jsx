import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const getUserData = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/auth/user_verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const parsedUser = JSON.parse(storedUser);
                setUser({
                    ...parsedUser,
                    isValid: true
                });
            } catch (error) {
                console.error("Auth error:", error);
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        } else {
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        getUserData();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large"/>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);