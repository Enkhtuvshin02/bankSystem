import axios from "axios";
import moment from "moment";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const TransactionHistory = ({sessionId}) => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    axios
      .get(`/transactionHistory`, {
        withCredentials: true,
        headers: { sessionId: sessionId },
      })
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const clearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearchQuery = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDateRange =
      (!startDate || new Date(transaction.transactionDate) >= startDate) &&
      (!endDate || new Date(transaction.transactionDate) <= endDate);
    return matchesSearchQuery && matchesDateRange;
  });

  return (
    <div className="historyContainer">
      <h1>Transfer History</h1>
      <div
        className="search-bar"
        style={{
          width: "85%",
        }}
      >
        <input
          type="text"
          className="form-control"
          placeholder="Search transactions"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <div className="date-picker">
        <DatePicker
          selected={startDate}
          onChange={handleStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          className="form-control"
        />
        <DatePicker
          selected={endDate}
          onChange={handleEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="End Date"
          className="form-control"
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={clearDates}
        >
          Clear Dates
        </button>
      </div>
      <div className="row transactionContainer">
        <div className="col-3">date</div>
        <div className="col-3">description</div>
        <div className="col-1">Amount</div>
        <div className="col-2"></div>
      </div>
      <div
        className="scrollspy-example"
        style={{ position: "relative", height: "400px", overflow: "auto" }}
      >
        {filteredTransactions.map((transaction, index) => (
          <div key={index} className="row transactionContainer">
            <div className="col-3">
              {moment(transaction.transactionDate).format(
                "dddd, MMMM Do YYYY, h:mm:ss A"
              )}
            </div>
            <div className="col-3">{transaction.description}</div>
            <div className="col-1">
              <p
                style={{
                  color: transaction.type === "expense" ? "red" : "green",
                }}
              >
                {transaction.amount + " "}
                {transaction.currency}
              </p>
            </div>
            <div className="col-2">
              <button
                type="button"
                className="btn btn-primary"
                data-toggle="modal"
                data-target={`#exampleModal${index}`}
              >
                See details
              </button>
            </div>
            <div
              className="modal fade"
              id={`exampleModal${index}`}
              tabIndex="-1"
              role="dialog"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                      Transaction Details
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <p>
                      Amount: {transaction.amount},{transaction.currency}
                    </p>
                    <p>Type: {transaction.type}</p>
                    <p>
                      Date:{" "}
                      {moment(transaction.transactionDate).format(
                        "dddd, MMMM Do YYYY, h:mm:ss A"
                      )}
                    </p>
                    <p>Sender Account: {transaction.senderAccount}</p>
                    <p>Receiver Account: {transaction.recipientAccount}</p>
                    <p>Description: {transaction.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
