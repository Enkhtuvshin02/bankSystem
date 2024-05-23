import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Navbar({ loggedUsersName, handleLogout }) {
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
