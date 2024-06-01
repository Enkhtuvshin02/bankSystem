import React, { useState } from "react";
import PropTypes from "prop-types";
import { useEffect } from "react";
import axios from "axios";
function Navbar({ handleLogout }) {
  const [loggedUsersName, setLoggedUsersName] = useState(null);
  useEffect(() => {
    axios
      .get(`/getName`, {
        withCredentials: true,
      })
      .then((res) => {
        setLoggedUsersName(res.data.username);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);
  return (
    <div>
      <ul className="nav justify-content-end">
        <li className="nav-item">
          <a className="nav-link" href="#">
            {loggedUsersName}
          </a>
        </li>

        <li className="nav-item">
          <a
            className="nav-link"
            href="#"
            onClick={() => {
              handleLogout();
            }}
          >
            LogOut
          </a>
        </li>
      </ul>
    </div>
  );
}

Navbar.propTypes = {
  handleLogout: PropTypes.func.isRequired,
};

export default Navbar;
