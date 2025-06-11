import React from 'react';
import './footer.scss'
import logo from "../../Assets/Images/logo.png";
import {Link} from "react-router-dom";

const Footer = () => {
    return (
        <footer>
            <div className="wrapper">
                <a href={'/'} className="logo">
                    <div>
                        <img src={logo} alt="Logo"/>
                        <p>
                            Спільнота Взаємодопомоги
                            "Обмінюй з користю"<br/>
                            <small>Даний проект не є комерціним</small>
                        </p>
                    </div>
                    <p>Всі права захищені &copy; {new Date().getFullYear()}</p>
                </a>

                <div className="menu">
                    <ul>
                        <li>
                            <Link to={'/'}>Каталог</Link>
                        </li>
                        <li>
                            <Link to={'/'}>Про нас</Link>
                        </li>
                        <li>
                            <Link to={'/'}>ЧаПи</Link>
                        </li>
                    </ul>
                </div>

                <div className="otherLinks">
                    <div className='schedule'>
                        <p>Пн-Сб, 8:00-16:00</p>
                        <a href="tel:380463584378">+38(046)-358-43-78</a>
                    </div>
                    <div className='socialLink'>
                        <a href='https://facebook.com' className="facebook"></a>
                        <a href='https://x.com' className="twitter"></a>
                        <a href='https://linkedin.com' className="linkedin"></a>
                        <a href='https://youtube.com' className="youtube"></a>
                    </div>
                </div>


            </div>
        </footer>
    );
};

export default Footer;