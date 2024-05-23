import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ isLoggedIn, handleLogin }) => {
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
          <div data-mdb-input-init class="form-outline mb-4">
            <label class="form-label" htmlFor="form2Example1">
              Login Name
            </label>
            <input
              type="text"
              id="form2Example1"
              class="form-control"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
            />
          </div>

          <div data-mdb-input-init class="form-outline mb-4">
            <label class="form-label" htmlFor="form2Example1">
              Password
            </label>
            <input
              type="password"
              id="form2Example1"
              class="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div class="row mb-4">
            <div class="col d-flex justify-content-center">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  value=""
                  id="form2Example31"
                  checked
                />
                <label class="form-check-label" for="form2Example31">
                  {" "}
                  Remember me{" "}
                </label>
              </div>
            </div>

            <div class="col">
              <a href="#!">Forgot password?</a>
            </div>
          </div>

          <button
            type="submit"
            data-mdb-button-init
            data-mdb-ripple-init
            class="btn btn-primary btn-block mb-4"
          >
            Login
          </button>
          <div class="text-center">
            <p>
              Not a member?{" "}
              <a
                onClick={() => {
                  navigate("/register");
                }}
              >
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
