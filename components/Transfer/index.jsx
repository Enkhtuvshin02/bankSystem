import axios from "axios";
import React, { useState, useEffect } from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import crypto from "crypto-browserify";


const Transfer = () => {
  const navigate = useNavigate();
  const [userAccounts, setUserAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState({
    selectedAccountNumber: "",
    selectedAccountType: "",
  });
  const [selectedBank, setSelectedBank] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientUserId, setRecipientUserId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionPassword, setTransactionPassword] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    axios
      .get(`getAccounts`, { withCredentials: true })
      .then((res) => {
        setAccounts(res.data.accounts);
        setUserAccounts(res.data.userAccounts);
        setBanks(res.data.banks);
        setSelectedBank(res.data.banks.length > 0 ? res.data.banks[0]._id : "");
        setSelectedAccount(
          res.data.userAccounts.length > 0
            ? {
                selectedAccountNumber: res.data.userAccounts[0].accountNumber,
                selectedAccountType: res.data.userAccounts[0].accountType,
              }
            : { selectedAccountNumber: "", selectedAccountType: "" }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("test submit");
    const hashedTransactionPassword = await crypto
      .createHash("sha256")
      .update(transactionPassword + userAccounts[0].salt)
      .digest("hex");

    if (hashedTransactionPassword !== userAccounts[0].transactionPassword) {
      alert("Transaction password did not match");
      return;
    }

    try {
      const data = await axios.post(
        `transfer`,
        {
          senderAccount: selectedAccount.selectedAccountNumber,
          recipientName: recipientName,
          recipientBank: selectedBank,
          recipientAccount: recipientAccount,
          description: description,
          amount: transferAmount,
          currency: selectedAccount.selectedAccountType,
          receiverUserId: recipientUserId,
          transactionPassword: hashedTransactionPassword,
        },
        { withCredentials: true }
      );
      if (data) {
        
        handleCloseModal(); 
        navigate("/");
      }
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
  const saveTemplate = async () => {
    if (
      !templateName ||
      !selectedAccount.selectedAccountNumber ||
      !recipientName ||
      !selectedBank ||
      !recipientAccount ||
      !selectedAccount.selectedAccountType ||
      !recipientUserId
    ) {
      alert("Шаардлагтай талбаруудыг бөглөнө үү!");
      return;
    }

    try {
      const data = await axios.post(
        `/saveTemplate`,
        {
          templateName,
          selectedAccountNumber: selectedAccount.selectedAccountNumber,
          recipientName,
          selectedBank,
          recipientAccount,
          selectedAccountType: selectedAccount.selectedAccountType,
          recipientUserId,
        },
        { withCredentials: true }
      );
      console.log(data);
      setShowTemplateModal(false);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleAccountChange = (e) => {
    const [selectedAccountNumber, selectedAccountType] =
      e.target.value.split(",");
    setSelectedAccount({ selectedAccountNumber, selectedAccountType });
  };

  const handleRecipientAccountChange = (e) => {
    const accountNumber = e.target.value;
    setRecipientAccount(accountNumber);

    const foundAccount = accounts.find(
      (acc) =>
        acc.accountNumber === accountNumber &&
        selectedAccount.selectedAccountType === acc.accountType
    );
    if (foundAccount) {
      setRecipientUserId(foundAccount.userId);
      setRecipientName(foundAccount.username);
    } else {
      console.log("not found");
      
    }
  };

  return (
    <>
      {userAccounts.length > 0 && (
        <Card
          style={{
            maxWidth: "500px",
            marginLeft: "5%",
            marginRight: "5%",
            padding: "20px",
          }}
        >
          <form className="transferForm" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label
                htmlFor="inputState"
                style={{
                  width: "400px",
                }}
              >
                Данс сонгох
              </label>
              <select
                id="inputState"
                className="form-control"
                value={`${selectedAccount.selectedAccountNumber},${selectedAccount.selectedAccountType}`}
                onChange={handleAccountChange}
              >
                {userAccounts.map((account, index) => (
                  <option
                    key={index}
                    value={`${account.accountNumber},${account.accountType}`}
                  >
                    {account.accountNumber}, {account.accountType}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="inputState">Банк сонгох</label>
              <select
                id="inputState"
                className="form-control"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                {banks.map((bank, index) => {
                  return (
                    <option key={index} value={bank._id}>
                      {bank.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                placeholder="Шилжүүлэх дүн"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                placeholder="Хүлээн авагчийн данс"
                value={recipientAccount}
                onChange={handleRecipientAccountChange}
              />
            </div>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                placeholder="Хүлээн авагчийн нэр"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                placeholder="Гүйлгээний утга"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              className={`modal fade ${showModal ? "show" : ""}`}
              id="exampleModal"
              tabIndex="-1"
              role="dialog"
              aria-labelledby="exampleModalLabel"
              aria-hidden={!showModal}
              style={{ display: showModal ? "block" : "none" }}
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
                      <span aria-hidden="true">&times;</span>
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
                            setTransactionPassword(e.target.value);
                          }}
                        />
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button type="submit" className="btn btn-primary">
                      Гүйлгээ хийх
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowTemplateModal(true);
            }}
            style={{
              marginTop: "10px",
              width: "150px",
            }}
          >
            Загвар хадгалах
          </button>
          <div
            className={`modal fade ${showTemplateModal ? "show" : ""}`}
            id="templateModal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden={!showTemplateModal}
            style={{ display: showTemplateModal ? "block" : "none" }}
          >
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div className="modal-header">
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setShowTemplateModal(false)}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <form>
                    <div class="form-group">
                      <label for="recipient-name" class="col-form-label">
                        Загварын нэр:
                      </label>
                      <input
                        type="text"
                        class="form-control"
                        id="recipient-name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                      />
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button
                    type="button"
                    class="btn btn-primary"
                    onClick={() => {
                      saveTemplate();
                    }}
                  >
                    Загвар хадгалах
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default Transfer;
