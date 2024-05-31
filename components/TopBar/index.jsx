import React from "react";
import PropTypes from "prop-types";

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
  loggedUsersName: PropTypes.string,
  handleLogout: PropTypes.func.isRequired,
};

export default Navbar;
