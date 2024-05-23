import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./styles.css"; // Make sure to import the CSS file
import { FaHome } from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";
function SideNav() {
  const location = useLocation();

  return (
    <div
      className="nav flex-column nav-pills"
      id="v-pills-tab"
      role="tablist"
      aria-orientation="vertical"
    >
      <Link
        className={`nav-link ${location.pathname === "/" ? "active show" : ""}`}
        id="v-pills-home-tab"
        to="/"
        role="tab"
        aria-controls="v-pills-home"
        aria-selected={location.pathname === "/"}
      >
        <FaHome />
        <span className="nav-text">Home</span>
      </Link>
      <Link
        className={`nav-link ${
          location.pathname === "/transactionHistory" ? "active show" : ""
        }`}
        id="v-pills-transaction-history-tab"
        to="/transactionHistory"
        role="tab"
        aria-controls="v-pills-transaction-history"
        aria-selected={location.pathname === "/transactionHistory"}
      >
        <IoFilterSharp />
        <span className="nav-text">Transaction History</span>
      </Link>
      <Link
        className={`nav-link ${
          location.pathname === "/transfer" ? "active show" : ""
        }`}
        id="v-pills-transfer-tab"
        to="/transfer"
        role="tab"
        aria-controls="v-pills-transfer"
        aria-selected={location.pathname === "/transfer"}
      >
        <FaMoneyBillTransfer />
        <span className="nav-text">Transfer</span>
      </Link>
    </div>
  );
}

export default SideNav;
