import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Icons from "react-icons/tb";
import { useDispatch } from "react-redux";
import Logo from "../../images/common/logo.png";
import Input from "../../components/common/Input.jsx";
import Button from "../../components/common/Button.jsx";
import CheckBox from "../../components/common/CheckBox.jsx";
import { login } from "../../store/slices/authenticationSlice.jsx";
import authenticationAPI from "../../apis/auth";
import { USER_ROLE } from "../../utils/constant.js";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isRemember, setIsRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (fieldName, newValue) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: newValue,
    }));
  };

  const handleRememberChange = (check) => {
    setIsRemember(check);
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false);

    try {
      const response = await authenticationAPI.HandleAuthentication("/sign-in", formData, "post");
      const { data } = response;

      // Store tokens if remember me is checked
      localStorage.setItem("access_token", data.tokens.accessToken);
      localStorage.setItem("refresh_token", data.tokens.refreshToken);
      dispatch(login(data.user));

      // Navigate based on user role
      const userRole = data.user.role;
      if (userRole === USER_ROLE.ADMIN) {
        navigate("/admin/dashboard");
      } else if (userRole === USER_ROLE.SHOP_OWNER) {
        navigate("/shop-owner/dashboard");
      } else {
        navigate("/"); // Default route for other roles
      }
    } catch (error) {
      setLoginError(true);
      setTimeout(() => {
        setLoginError(false);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login_sidebar">
        <figure className="login_image">
          <img
            src="https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Coffee shop"
          />
        </figure>
      </div>
      <div className="login_form">
        <div className="login_content">
          <div to="/" className="logo" style={{ height: "250px", width: "auto" }}>
            <img src={Logo} alt="logo" />
          </div>
          <h2 className="page_heading">Login</h2>
        </div>
        <form className="form" onSubmit={handleLogin}>
          <div className="form_control">
            <Input
              type="text"
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              placeholder="Email or Phone Number"
              icon={<Icons.TbMail />}
              label="Email or Number"
            />
          </div>
          <div className="form_control">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(value) => handleInputChange("password", value)}
              placeholder="Password"
              label="Password"
              onClick={handleShowPassword}
              icon={<Icons.TbEye />}
            />
          </div>
          <div className="form_control">
            <CheckBox
              id="rememberCheckbox"
              label="Remember me"
              checked={isRemember}
              onChange={handleRememberChange}
            />
          </div>
          {loginError && (
            <small className="incorrect">Incorrect email or password</small>
          )}
          <div className="form_control">
            <Button
              label={isLoading ? "Logging in..." : "Login"}
              type="submit"
              disabled={isLoading}
            />
          </div>
        </form>
        <p className="signup_link">
          Don't have an account yet? <Link to="/signup">Join Metronic</Link>
        </p>
        <button className="google_signin">
          <figure>
            <img
              src="https://img.icons8.com/color/1000/google-logo.png"
              alt=""
            />
          </figure>
          <h2>Sign in with Google</h2>
        </button>
      </div>
    </div>
  );
};

export default Login;