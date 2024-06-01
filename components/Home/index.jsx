import { Container, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import crypto from "crypto-browserify";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);
const Home = () => {
  const modalRefs = useRef([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountIndex, setAccountIndex] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [transferAmount, setTransferAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [transactionPassword, setTransactionPassword] = useState("");
  const [transferDetail, setTransferDetail] = useState(null);

  const openTransferDetail = (index) => {
    setTransferDetail(index);
  };

  const closeTransferDetail = () => {
    setTransferDetail(null);
  };
  // Doughnut chart data
  const [chartData, setChartData] = useState({
    labels: ["Зарлага", "Орлого"],
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
  //newchanges new get request
  useEffect(() => {
    axios
      .all([
        axios.get(`/transactionHistory`, {
          withCredentials: true,
        }),
        axios.get(`/getPersonalAccounts`, {
          withCredentials: true,
        }),
        axios.get(`/getTemplates`, {
          withCredentials: true,
        }),
      ])
      .then((res) => {
        const [res1, res2, res3] = res;
        setTransactions(res1.data);
        setAccounts(res2.data);
        updateChartData(res1.data);
        setTemplates(res3.data);
        console.log(res3.data);
      })
      .catch((err) => {
        console.error(err);
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

  const handleLaunchModal = (index) => {
    const modalElement = modalRefs.current[index];
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  };
  const handleFormSubmit = async (e, index) => {
    e.preventDefault();
    const hashedTransactionPassword = await crypto
      .createHash("sha256")
      .update(transactionPassword + accounts[0].salt)
      .digest("hex");

    if (hashedTransactionPassword !== accounts[0].transactionPassword) {
      alert("Transaction password did not match");
      return;
    }

    try {
      const data = await axios.post(
        `/transfer`,
        {
          senderAccount: templates[index].senderAccount,
          recipientAccount: templates[index].recipientAccount,
          description: description,
          amount: transferAmount,
          transactionPassword: hashedTransactionPassword,
        },
        { withCredentials: true }
      );
      console.log(data);
      setShowModal(false);
    } catch (err) {
      console.log(err.response);
      if (err.response.data === "Recipient") {
        alert("Check account number or bank");
      } else if (err.response.data === "Balance") {
        alert("Balance not enough");
      } else if (err.response.data === "Transaction password") {
        alert("Balance not enough");
      } else {
        alert("Transfer failed");
      }
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
                                key={index + 1}
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
                                key={index--}
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
                                          fontSize: "smaller",
                                        }}
                                      >
                                        {account.accountNumber}
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
                                        10/2{index}
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

                              <div className="account-details" key={index++}>
                                <h5>
                                  Нийт үлдэгдэл{":" + account.balance}{" "}
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
                <Card.Body className="templateContainer">
                  {templates.map((template, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <h5>{template.templateName}</h5>
                      <p>
                        {template.bankName + " "}
                        {template.recipientName}
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleLaunchModal(index)}
                      >
                        Гүйлгээ
                      </button>

                      <div
                        className="modal fade"
                        ref={(el) => (modalRefs.current[index] = el)}
                        id={`exampleModal${index}`}
                        tabIndex="-1"
                        role="dialog"
                        aria-labelledby={`exampleModalLabel${index}`}
                        aria-hidden="true"
                      >
                        <div className="modal-dialog" role="document">
                          <div className="modal-content">
                            <div className="modal-header">
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
                              <form
                                className="transferForm"
                                onSubmit={(e) => handleFormSubmit(e, index)}
                              >
                                <div className="form-group">
                                  <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Гүйлгээний дүн"
                                    value={template.senderAccount}
                                    disabled
                                  />
                                </div>
                                <div className="form-group">
                                  <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Гүйлгээний дүн"
                                    value={template.bankName}
                                    disabled
                                  />
                                </div>
                                <div className="form-group">
                                  <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Transfer amount"
                                    value={transferAmount}
                                    onChange={(e) =>
                                      setTransferAmount(e.target.value)
                                    }
                                  />
                                </div>
                                <div className="form-group">
                                  <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Recipient account"
                                    value={template.recipientAccount}
                                    disabled
                                  />
                                </div>
                                <div className="form-group">
                                  <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Recipient name"
                                    value={template.recipientName}
                                    disabled
                                  />
                                </div>
                                <div className="form-group">
                                  <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Гүйлгээний утга"
                                    value={description}
                                    onChange={(e) =>
                                      setDescription(e.target.value)
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() => setShowModal(true)}
                                >
                                  Гүйлгээ хийх
                                </button>

                                <div
                                  className={`modal fade ${
                                    showModal ? "show" : ""
                                  }`}
                                  id="exampleModal"
                                  tabIndex="-1"
                                  role="dialog"
                                  aria-labelledby="exampleModalLabel"
                                  aria-hidden={!showModal}
                                  style={{
                                    display: showModal ? "block" : "none",
                                  }}
                                >
                                  <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                      <div className="modal-header">
                                        <button
                                          type="button"
                                          className="close"
                                          data-dismiss="modal"
                                          aria-label="Close"
                                          onClick={() => setShowModal(false)}
                                        >
                                          <span aria-hidden="true">
                                            &times;
                                          </span>
                                        </button>
                                      </div>
                                      <div className="modal-body">
                                        <form>
                                          <div className="form-group">
                                            <label
                                              htmlFor="recipient-name"
                                              className="col-form-label"
                                            >
                                              Гүйлгээний нууц үг
                                            </label>
                                            <input
                                              type="password"
                                              className="form-control"
                                              id="recipient-name"
                                              value={transactionPassword}
                                              onChange={(e) => {
                                                setTransactionPassword(
                                                  e.target.value
                                                );
                                              }}
                                            />
                                          </div>
                                        </form>
                                      </div>
                                      <div className="modal-footer">
                                        <button
                                          type="submit"
                                          className="btn btn-primary"
                                        >
                                          Гүйлгээ хийх
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
            <h4
              style={{
                marginTop: "10px",
                marginLeft: "30px",
              }}
            >
              Гүйлгээний түүх
            </h4>
            <ul>
              {Array.isArray(transactions) &&
                transactions
                  .sort(
                    (a, b) =>
                      new Date(b.transactionDate) - new Date(a.transactionDate)
                  )
                  .slice(0, 4)
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
                              onClick={() => openTransferDetail(index)}
                            >
                              Дэлгэрэнгүй
                            </button>
                          </div>

                          {transferDetail === index && (
                            <div
                              className="modal fade show"
                              id={`exampleModal${index}`}
                              tabIndex="-1"
                              role="dialog"
                              aria-labelledby="exampleModalLabel"
                              aria-hidden="true"
                              style={{
                                position: "fixed",
                                top: "0",
                                left: "0",
                                right: "0",
                                bottom: "0",
                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: "1000",
                              }}
                            >
                              <div className="modal-dialog" role="document">
                                <div className="modal-content">
                                  <div className="modal-header">
                                    <h5
                                      className="modal-title"
                                      id="exampleModalLabel"
                                    >
                                      Гүйлгээний мэдээлэл
                                    </h5>
                                    <button
                                      type="button"
                                      className="close"
                                      onClick={closeTransferDetail}
                                      aria-label="Close"
                                    >
                                      <span aria-hidden="true">&times;</span>
                                    </button>
                                  </div>
                                  <div className="modal-body">
                                    <p>
                                      Дүн: {transaction.amount}{" "}
                                      {transaction.currency}
                                    </p>
                                    <p>
                                      Огноо:{" "}
                                      {moment(
                                        transaction.transactionDate
                                      ).format("dddd, MMMM Do YYYY, h:mm:ss A")}
                                    </p>
                                    <p>
                                      Шилжүүлэгч: {transaction.senderAccount}
                                    </p>
                                    <p>
                                      Хүлээн авагч:{" "}
                                      {transaction.recipientAccount}
                                    </p>
                                    <p>
                                      Гүйлгээнийи утга:{" "}
                                      {transaction.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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

export default Home;
