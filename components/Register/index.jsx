import React, { useState } from "react";
import axios from "axios";

import { Navigate } from "react-router-dom";
const Register = () => {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(`/auth/register`, { loginName, password })
        .then((res) => {});
      navigate("/transfer");
    } catch (err) {
      console.error(err);
      alert("Error registering user");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="text"
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
        placeholder="LoginName"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
