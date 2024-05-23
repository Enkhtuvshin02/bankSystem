import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  HashRouter as Router, 
  Route,
  Routes,
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
  const [loggedUsersName, setLoggedUsersName] = useState(null);
  const [timer, setTimer] = useState(600); 

  useEffect(() => {
    axios
      .get(`/isLoggedIn`, {
        withCredentials: true,
      })
      .then(
        (res) => {
          setIsLoggedIn(res.data.isLoggedIn);
          setLoggedUsersName(res.data.username);
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

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            handleLogout();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setTimer(600);
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
        {isLoggedIn && (
          <div
            style={{
              position: "absolute",
              top: "9px",
              right: "210px",
              color: "#0d6efd",
            }}
          >
            Холболт салах: {formatTime(timer)}
          </div>
        )}
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
