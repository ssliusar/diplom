import React, {useEffect, useState} from 'react';
import './questionPage.scss'
import {List} from "antd";
import axios from "axios";

const QuestionPage = () => {

    const [isData,setData]= useState([])

    const getQuestion = async () => {
        const {data} = await axios.get(`${import.meta.env.VITE_API}/question/getQuestions`);

        setData(data)
    }

    useEffect(() => {
        getQuestion()
    }, []);

    return (
        <div className="wrapper">
            <div className='questionContent'>
                <h1>Часті питання</h1>
                <div className="list">
                <List
                    itemLayout="vertical"
                    size="large"
                    pagination={{
                        onChange: (page) => {
                            console.log(page);
                        },
                        pageSize: 10,
                    }}
                    dataSource={isData}
                    renderItem={(item) => (
                        <List.Item
                            key={item.title}
                            className='listItem'
                        >
                            <div style={{ display: "flex", alignItems: "flex-start" }}>
                                <div>
                                    <List.Item.Meta
                                        title={item.question}
                                    />
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
                </div>
            </div>
        </div>
    );
};

export default QuestionPage;