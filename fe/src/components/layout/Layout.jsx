import Main from "./Main.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";
import Login from "../../pages/login/Login.jsx";
import Signup from "../../pages/login/Signup.jsx";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, useNavigate } from "react-router-dom";
import { login } from "../../store/slices/authenticationSlice.jsx";
import userAPI from './../../apis/user';

const Layout = () => {
  const isAuthenticated = useSelector(
    (state) => state.authentication.isAuthenticated
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    const verifyAndRestoreUser = async () => {
      if (accessToken) {
        try {
          const response = await userAPI.HandleUser("/profile");
          dispatch(login(response.data.user));
        } catch (error) {
          console.error("Token expired or invalid");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    };

    verifyAndRestoreUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/catalog/product/manage");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      ) : (
        <>
          <Sidebar />
          <div className="admin_body">
            <Navbar />
            <Main />
            <Footer />
          </div>
        </>
      )}
    </>
  );
};

export default Layout;
