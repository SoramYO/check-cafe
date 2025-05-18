import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { adminRoutes, shopRoutes } from './Routes.jsx';
import { useSelector } from 'react-redux';
import { USER_ROLE } from '../../utils/constant.js';
const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.authentication.user);

  const routes = user?.role === USER_ROLE.ADMIN ? adminRoutes : shopRoutes;

  // useEffect(() => {
  //   if (location.pathname === '/panel' || location.pathname === '/admin') {
  //     navigate('/admin/dashboard');
  //   }
  // }, [location, navigate]);

  return (
    <div className="main">
      <Routes>
          {routes.map((route, key) => (
            <Route
              key={key}
              path={`${route.path}`}
              element={route.element}
            />
          ))}
      </Routes>
    </div>
  );
};

export default Main;
