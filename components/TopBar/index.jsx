import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config.js";

function Navbar({ loggedUsersName, handleLogout }) {
  return (
    <div>
      <ul className="nav justify-content-end">
        {loggedUsersName && (
          <li className="nav-item">
            <a className="nav-link" href="#">
              {loggedUsersName}
            </a>
          </li>
        )}

        <li className="nav-item">
          <a
            className="nav-link "
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

export default Navbar;
