import {Suspense} from 'react'
import HomePage from "./Pages/HomePage/HomePage.jsx";
import Header from "./Components/Header/Header.jsx";
import {Route, Routes} from "react-router-dom";
import Footer from "./Components/Footer/Footer.jsx";
import LotteryPage from "./Pages/LotteryPage/LotteryPage.jsx";
import QuestionPage from "./Pages/QuestionPage/QuestionPage.jsx";
import LoginPage from "./Pages/LoginPage/LoginPage.jsx";
import BookingItemPage from "./Pages/BookingItemPage/BookingItemPage.jsx";
import CreateItemPage from "./Pages/CreateItemPage/CreateItemPage.jsx";
import CreateLotteryPage from "./Pages/CreateLotteryPage/CreateLotteryPage.jsx";
import ManageLotteryPage from "./Pages/ManageLotteryPage/ManageLotteryPage.jsx";
import UserPage from "./Pages/UserCabinet/UserPage.jsx";
import ItemPage from "./Pages/ItemPage/ItemPage.jsx";
import NotFoundPage from "./Pages/NotFoundPage/NotFoundPage.jsx";
import AboutPage from "./Pages/AboutPage/AboutPage.jsx";
import CatalogPage from "./Pages/CatalogPage/CatalogPage.jsx";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute.jsx";

function App() {
  const routes = [
    {
      link: '/',
      element: <HomePage/>,
    },
      {
          link: '/lottery',
          element: <LotteryPage/>,
      },
      {
          link: '/question',
          element: <QuestionPage/>,
      },
      {
          link: '/login',
          element: <ProtectedRoute element={<LoginPage/>}/>,
      },
      {
          link: '/manager',
          element: <ProtectedRoute element={ <BookingItemPage/>}/>,
      },
      {
          link: '/createbooking',
          element: <ProtectedRoute element={<CreateItemPage/>}/>,
      },
      {
          link: '/createlottery',
          element: <ProtectedRoute element={ <CreateLotteryPage/>}/>,
      },
      {
          link: '/admin',
          element: <ProtectedRoute element={ <ManageLotteryPage/>}/>,
      },
      {
          link: '/panel',
          element: <ProtectedRoute element={<UserPage/>} />,
      },
      {
          link: '/catalog/item/:id',
          element: <ItemPage/>,
      },
      {
          link: '/notfoundpage',
          element: <NotFoundPage/>,
      },
      {
          link: '/about',
          element: <AboutPage banner={true}/>,
      },
      {
          link: '/catalog',
          element: <CatalogPage/>,
      },
      {
          link: '*',
          element: <NotFoundPage/>,
      }

  ];

  return (
      <div className="content">
          <Routes>
            {routes.map(route => (
                <Route
                    key={route.link}
                    path={route.link}
                    element={
                      <Suspense>
                        <Header/>
                        <main>
                          {route.element}
                        </main>
                        <Footer/>
                      </Suspense>
                    }
                />
            ))}
          </Routes>
      </div>
  );
}

export default App
