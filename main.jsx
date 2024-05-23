import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  HashRouter as Router, // Change BrowserRouter to HashRouter
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";

import axios from "axios";
import TransactionHistory from "./components/TransactionHistory/index.jsx";
import Login from "./components/Login/index.jsx";
import Topbar from "./components/TopBar/index.jsx";
import Transfer from "./components/Transfer/index.jsx";
import Home from "./components/Home/index.jsx";
import SideNav from "./components/SideNav/index.jsx";

import "./styles/main.css";

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loggedUsersName, setloggedUsersName] = useState(null);
  useEffect(() => {
    axios
      .get(`/isLoggedIn`, { withCredentials: true })
      .then(
        (res) => {
          console.log(res.data.username);
          setIsLoggedIn(res.data.isLoggedIn);
          setloggedUsersName(res.data.username);
          setLoading(false);
        },
        () => {
          if (isLoggedIn === false) {
            navigate("/login");
          }
        }
      )
      .catch(() => {
        setIsLoggedIn(false);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    axios
      .post(`/auth/logout`, {}, { withCredentials: true })
      .then(() => {
        setIsLoggedIn(false);
        navigate("/login");
      })
      .catch((err) => {
        console.error("Logout failed:", err);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isLoggedIn ? (
        <Topbar loggedUsersName={loggedUsersName} handleLogout={handleLogout} />
      ) : null}
      <div className="main">
        {isLoggedIn ? <SideNav /> : null}
        <Routes>
          <Route
            path="/login"
            element={
              <Login isLoggedIn={isLoggedIn} handleLogin={handleLogin} />
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/transactionHistory" element={<TransactionHistory />} />
          <Route path="/transfer" element={<Transfer />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
ReactDOM.createRoot(document.getElementById("photoshareapp")).render(<App />);
