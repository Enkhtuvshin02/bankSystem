import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import moment from "moment";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);
const BentoUI = ({sessionId}) => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountIndex, setAccountIndex] = useState(0);
  const [error, setError] = useState(null);

  // Doughnut chart data
  const [chartData, setChartData] = useState({
    labels: ["Expenses", "Incomes"],
    datasets: [
      {
        label: "Amount",
        data: [0, 0],
        backgroundColor: ["#bbe4e9 ", "#79c2d0"],
        borderColor: ["#bbe4e9", "#79c2d0"],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    console.log("session id in home before send req "+sessionId)
    axios
      .all([
        axios.get(`/transactionHistory`, {
          headers: { sessionId: sessionId },
          withCredentials: true,
        }),
        axios.get(`/getPersonalAccounts`, {
          headers: { sessionId: sessionId },
          withCredentials: true,
        }),
      ])
      .then((res) => {
        const [res1, res2] = res;
        setTransactions(res1.data);
        setAccounts(res2.data);
        updateChartData(res1.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch data. Please try again later.");
      });
  }, []);

  const updateChartData = (transactionsData) => {
    let expenses = 0;
    let incomes = 0;

    if (Array.isArray(transactionsData)) {
      transactionsData.forEach((transaction) => {
        if (transaction.type === "expense") {
          expenses += transaction.amount;
        } else if (transaction.type === "income") {
          incomes += transaction.amount;
        }
      });
    }

    setChartData({
      ...chartData,
      datasets: [
        {
          ...chartData.datasets[0],
          data: [expenses, incomes],
        },
      ],
    });
  };
  const prev = () => {
    setAccountIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
  };

  const next = () => {
    setAccountIndex((prevIndex) =>
      prevIndex < accounts.length - 1 ? prevIndex + 1 : accounts.length - 1
    );
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        prev();
        break;
      case "ArrowRight":
        next();
        break;
      default:
        break;
    }
  };

  return (
    <Container fluid className="p-3">
      <Row className="bentoRow">
        <Col xs={12} xl={7}>
          <Row>
            <Col xs={12} md={6} lg={6} className="mb-3">
              <Card className="h-100">
                <div className="accountContainer">
                  {Array.isArray(accounts) &&
                    accounts.map((account, index) => {
                      try {
                        if (index === accountIndex) {
                          return (
                            <>
                              <div
                                key={index}
                                style={{
                                  width: "80%",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-end",
                                }}
                              >
                                <h5>My Cards</h5>
                                <div>
                                  {" "}
                                  <button className="prev" onClick={prev}>
                                    {"<"}
                                  </button>
                                  <button className="next" onClick={next}>
                                    {">"}
                                  </button>
                                </div>
                              </div>
                              <Col
                                key={index}
                                xs={12}
                                sm={8}
                                md={10}
                                lg={10}
                                xl={12}
                                className="cardContainer"
                              >
                                <div className="card-inner">
                                  <div className="front">
                                    <img
                                      src="https://i.ibb.co/PYss3yv/map.png"
                                      className="map-img"
                                      alt="Map"
                                    />
                                    <div className="row logoRow">
                                      <img
                                        src="https://i.ibb.co/G9pDnYJ/chip.png"
                                        width="60px"
                                        alt="Chip"
                                        style={{
                                          height: "25px",
                                          width: "60px",
                                        }}
                                      />
                                      <img
                                        src="https://i.ibb.co/WHZ3nRJ/visa.png"
                                        width="60px"
                                        alt="Visa"
                                        style={{
                                          height: "20px",
                                          width: "70px",
                                        }}
                                      />
                                    </div>
                                    <div className="row card-no">
                                      <p
                                        style={{
                                          color: "white",
                                          width: "fit-content",
                                        }}
                                      >
                                        5244215082526420
                                      </p>
                                    </div>
                                    <div
                                      className="row"
                                      style={{
                                        display: "flex",
                                        flexDirection: "row",
                                      }}
                                    >
                                      <p
                                        style={{
                                          color: "white",
                                          width: "fit-content",
                                        }}
                                      >
                                        {account.username}
                                      </p>
                                      <p
                                        style={{
                                          color: "white",
                                          width: "fit-content",
                                        }}
                                      >
                                        {" "}
                                        10 / 2{index}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="back">
                                    <img
                                      src="https://i.ibb.co/PYss3yv/map.png"
                                      className="map-img"
                                      alt="Map"
                                    />
                                    <div className="bar"></div>
                                    <div
                                      style={{
                                        marginTop: "30px",
                                        width: "100%",
                                        height: "30px",
                                        display: "flex",
                                        flexDirection: "row",
                                      }}
                                    >
                                      <img
                                        src="https://i.ibb.co/S6JG8px/pattern.png"
                                        alt="Pattern"
                                        style={{
                                          width: "80%",
                                        }}
                                      />{" "}
                                      <p
                                        style={{
                                          height: "100%",
                                          width: "fit-content",
                                          background: "white",
                                        }}
                                      >
                                        82{index}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Col>

                              <div className="account-details" key={index}>
                                <h5>
                                  Total Balance{":" + account.balance}{" "}
                                  {" " + account.accountType}
                                </h5>
                              </div>
                            </>
                          );
                        }
                      } catch (error) {
                        console.error("Error processing account:", error);
                      }
                      return null;
                    })}
                </div>
              </Card>
            </Col>
            <Col xs={12} md={6} lg={6} className="mb-3">
              <Card className="h-100">
                <div
                  className="chart-container"
                  style={{
                    height: "345px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      height: "90%",
                      width: "fit-content",
                    }}
                  >
                    <Doughnut data={chartData} />
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={12} md={12} lg={12} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Dream Laptop</Card.Title>
                  <Card.Text>$116 / $1530</Card.Text>
                  <Card.Text>15% Completed</Card.Text>
                  <div className="progress-placeholder">Progress bar here</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
        <div className="w-100 d-md-none my-3"></div>{" "}
        {/* Divider for small screens */}
        <Col xs={12} xl={5}>
          <Card
            className="h-100 transferHistory"
            style={{
              height: "75vh ",
            }}
          >
            <h1>Transfer History</h1>
            <ul>
              {Array.isArray(transactions) &&
                transactions
                  .slice(0, Math.min(4, transactions.length))
                  .map((transaction, index) => {
                    try {
                      return (
                        <div className="transactionContainer" key={index}>
                          <p>
                            {moment(transaction.transactionDate).format(
                              "dddd, MMMM Do YYYY, h:mm:ss A"
                            )}
                          </p>
                          <p>{transaction.description}</p>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <p
                              style={{
                                color:
                                  transaction.type === "expense"
                                    ? "red"
                                    : "green",
                                width: "fit-content",
                              }}
                            >
                              {transaction.amount} USD
                            </p>
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
                                  <h5
                                    className="modal-title"
                                    id="exampleModalLabel"
                                  >
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
                                  <p>Amount: {transaction.amount} USD</p>
                                  <p>
                                    Date:{" "}
                                    {moment(transaction.transactionDate).format(
                                      "dddd, MMMM Do YYYY, h:mm:ss A"
                                    )}
                                  </p>
                                  <p>
                                    Sender Account: {transaction.senderAccount}
                                  </p>
                                  <p>
                                    Receiver Account:{" "}
                                    {transaction.recipientAccount}
                                  </p>
                                  <p>Description: {transaction.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error("Error processing transaction:", error);
                      return null;
                    }
                  })}
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BentoUI;
