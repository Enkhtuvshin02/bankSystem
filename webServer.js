import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from "dotenv";
import User from "./models/user.js";
import Account from "./models/account.js";
import Transaction from "./models/transaction.js";
import Bank from "./models/bank.js";
import crypto from "crypto";
import Template from "./models/template.js";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(__dirname));
app.use(express.json());
app.use(cookieParser());
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_URI, { dbName: "bankSystem" })
  .then(() => {
    app.listen(3000, () => {
      console.log(`Listening at http://localhost:3000`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/isLoggedIn", async (req, res) => {
  const userId = req.cookies.userId;
  const username = req.cookies.username;

  if (!userId) {
    res.json({ isLoggedIn: false });
  } else {
    res.json({ isLoggedIn: true, username });
  }
});

app.get("/getName", async (req, res) => {
  const username = req.cookies.username;

  if (!username) {
    res.json("Not logged in");
  } else {
    res.json({ username });
  }
});
app.post("/auth/login", async (req, res) => {
  const { loginName, password } = req.body;
  try {
    const user = await User.findOne({ loginName });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + user.salt)
      .digest("hex");
    if (hashedPassword !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.cookie("userId", user._id, { httpOnly: true });
    res.cookie("username", `${user.firstName} ${user.lastName}`, {
      httpOnly: true,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Failed to log in" });
  }
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("userId", { httpOnly: true });
  res.clearCookie("username", { httpOnly: true });

  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/saveTemplate", async (req, res) => {
  const sessionCookie = req.cookies.session;
  const userId = sessionCookie.userId;
  try {
    const { templateName, selectedAccountNumber, recipientAccount } = req.body;
    const newTemplate = new Template({
      userId,
      templateName: templateName,
      senderAccount: selectedAccountNumber,
      recipientAccount: recipientAccount,
    });
    await newTemplate.save();

    res.status(200).json(newTemplate._id);
  } catch (err) {
    console.error("Error adding template:", err);
    res.status(500).json({ message: "Failed to create template" });
  }
  return null;
});

app.get("/getTemplates", (req, res) => {
  const userId = req.cookies.userId;

  Template.find({ userId })
    .then(async (templates) => {
      const templatesWithBankNames = await Promise.all(
        templates.map(async (template) => {
          const account = await Account.findOne({
            accountNumber: template.recipientAccount,
          });
          const user = await User.findOne({
            _id: account.userId,
          });
          const bank = await Bank.findOne({
            _id: account.bankId,
          });
          return {
            ...template._doc,
            bankName: bank ? bank.name : "Unknown Bank",
            recipientName: user.firstName + " " + user.lastName,
          };
        })
      );
      res.json(templatesWithBankNames);
    })
    .catch((err) => {
      console.error("Error fetching templates:", err);
      res.status(500).json({ error: "Failed to fetch templates" });
    });
});

app.post("/auth/register", async (req, res) => {
  try {
    const { loginName, password } = req.body;
    const found = await User.findOne({ loginName });
    if (found) {
      return res
        .status(400)
        .json({ message: "User with this login name already exists" });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex");

    const newUser = new User({
      loginName,
      password: hashedPassword,
      salt,
    });

    await newUser.save();

    res.status(200).json(newUser);
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.get("/user/list", (req, res) => {
  User.find({})
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    });
});
app.get("/transactionHistory", async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userAccounts = await Account.find({ userId: userId });

    const transactionsPromises = userAccounts.map(async (account) => {
      const transactions = await Transaction.find({
        $or: [
          { senderAccount: account.accountNumber },
          { recipientAccount: account.accountNumber },
        ],
      }).lean(); // Use lean() to return plain objects
      return transactions.map((transaction) => {
        if (transaction.senderAccount === account.accountNumber) {
          return {
            ...transaction,
            type: "expense",
            currency: account.accountType,
          };
        } else if (transaction.recipientAccount === account.accountNumber) {
          return {
            ...transaction,
            type: "income",
            currency: account.accountType,
          };
        }
      });
    });

    const transactions = await Promise.all(transactionsPromises);
    const modifiedTransactions = transactions.flat();

    res.json(modifiedTransactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});
app.post("/transfer", async (req, res) => {
  const senderUserId = req.cookies.userId;

  if (!senderUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const {
      senderAccount,
      recipientAccount,
      description,
      amount,
      transactionPassword,
    } = await req.body;
    const transferAmount = parseFloat(amount);
    const user = await User.findOne({ _id: senderUserId });
    if (transactionPassword !== user.transactionPassword) {
      return res.status(400).json("Transaction password didn't match");
    }

    const receiver = await Account.findOne({
      accountNumber: recipientAccount,
    });
    if (!receiver) {
      return res.status(404).json("Recipient account not found");
    }

    const sender = await Account.findOne({ accountNumber: senderAccount });
    if (sender.balance < transferAmount) {
      return res.status(400).json("Insufficient funds");
    }

    sender.balance -= transferAmount;
    receiver.balance += transferAmount;

    await sender.save();
    await receiver.save();

    const newTransaction = new Transaction({
      senderAccount,
      recipientAccount,
      description,
      amount: transferAmount,
    });
    await newTransaction.save();

    res.status(200).json({ transactionId: newTransaction._id });
  } catch (err) {
    console.error("Error adding transaction:", err);
    res
      .status(500)
      .json({ message: "Failed to create transaction", error: err.message });
  }
});

app.get("/getAccounts", async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userAccounts = await Account.find({ userId }).lean();

    const accounts = await Account.find({}).lean();

    const extractTransactionPassword = async (account) => {
      const user = await User.findOne({ _id: account.userId }).lean();
      return {
        ...account,
        transactionPassword: user.transactionPassword,
        salt: user.salt,
      };
    };

    const extractUsername = async (account) => {
      const user = await User.findOne({ _id: account.userId }).lean();
      return { ...account, username: user.firstName + " " + user.lastName };
    };

    const userAccountsFormatted = await Promise.all(
      userAccounts.map(extractTransactionPassword)
    );

    const accountsFormatted = await Promise.all(accounts.map(extractUsername));
    const banks = await Bank.find({}).lean();
    res.json({
      userAccounts: userAccountsFormatted,
      accounts: accountsFormatted,
      banks,
    });
  } catch (err) {
    console.error("Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

app.get("/getBanks", async (req, res) => {
  try {
    const banks = await Bank.find({}).lean();
    res.json(banks);
  } catch (err) {
    console.error("Error fetching banks:", err);
    res.status(500).json({ error: "Failed to fetch banks" });
  }
});

app.get("/getPersonalAccounts", async (req, res) => {
  const userId = req.cookies.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const accounts = await Account.find({ userId }).lean();
    const extractTransactionPassword = async (account) => {
      const user = await User.findOne({ _id: account.userId }).lean();
      return {
        ...account,
        transactionPassword: user.transactionPassword,
        salt: user.salt,
      };
    };
    const extractUsername = async (account) => {
      const user = await User.findOne({ _id: account.userId }).lean();
      return { ...account, username: user.firstName + " " + user.lastName };
    };

    const accountsFormatted1 = await Promise.all(accounts.map(extractUsername));
    const accountsFormatted2 = await Promise.all(
      accountsFormatted1.map(extractTransactionPassword)
    );
    res.status(200).json(accountsFormatted2);
  } catch (err) {
    console.error("Error fetching personal accounts:", err);
    res.status(500).json({ error: "Failed to fetch personal accounts" });
  }
});
