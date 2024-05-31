import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
const Login = ({ handleLogin }) => {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const Login = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `/auth/login`,
        {
          loginName,
          password,
        },
        { withCredentials: true }
      );
      handleLogin(data);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "40%",
        }}
      >
        <form onSubmit={Login}>
          <div data-mdb-input-init className="form-outline mb-4">
            <label className="form-label" htmlFor="form2Example1">
              Нэвтрэх нэр
            </label>
            <input
              type="text"
              id="form2Example1"
              className="form-control"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
            />
          </div>

          <div data-mdb-input-init className="form-outline mb-4">
            <label className="form-label" htmlFor="form2Example1">
              Нууц үг
            </label>
            <input
              type="password"
              id="form2Example1"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="row mb-4">
            <div className="col d-flex justify-content-center">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id="form2Example31"
                  checked
                />
                <label className="form-check-label" htmlFor="form2Example31">
                  {" "}
                  Сануулах{" "}
                </label>
              </div>
            </div>

            <div className="col">
              <a href="#!">Нууц үг сэргээх?</a>
            </div>
          </div>

          <button
            type="submit"
            data-mdb-button-init
            data-mdb-ripple-init
            className="btn btn-primary btn-block mb-4"
          >
            Нэвтрэх
          </button>
          <div className="text-center">
            <p>
              Хэрэглэгч биш үү?{" "}
              <a
                onClick={() => {
                  navigate("/register");
                }}
              >
                Бүртгүүлэх
              </a>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

Login.propTypes = {
  handleLogin: PropTypes.func.isRequired,
};

export default Login;
