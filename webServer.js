import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import User from "./models/user.js";
import Account from "./models/account.js";
import Transaction from "./models/transaction.js";
import Bank from "./models/bank.js";
import crypto from "crypto";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretKey",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URI,
      dbName: "bankSystem",
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(express.static(__dirname));
app.use(express.json());
app.use(cors());

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

app.get("/isLoggedIn",async (req, res) => {
  const accounts = await Account.find({}).lean();
  console.log(req.session.isLoggedIn);
  if (req.session.isLoggedIn === undefined) {
    res.json({ isLoggedIn: false, accounts });
  } else {
    res.json({
      isLoggedIn: req.session.isLoggedIn,
      username: req.session.username,
    });
  }
});

app.post("/auth/login", async (req, res) => {
  const { loginName, password } = req.body;
  try {
    const user = await User.findOne({ loginName });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashedPassword = await crypto
      .createHash("sha256")
      .update(password + user.salt)
      .digest("hex");

    if (hashedPassword !== user.password) {
      console.log("Invalid credentials");
      return res
        .status(400)
        .json({
          message: "Invalid credentials",
          hashedPassword: hashedPassword,
        });
    }

    req.session.isLoggedIn = true;
    req.session.userId = user._id;
    req.session.username = user.firstName + " " + user.lastName;

    res.status(200).json({ message: "success",  session:req.session.userId });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Failed to log in" });
  }
});

app.post("/auth/logout", (req, res) => {
  console.log("Before destroy:", req.session);
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Failed to log out" });
    } else {
      console.log("After destroy:", req.session);
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    }
  });
});

app.post("/auth/register", async (req, res) => {
  try {
    const { loginName } = req.body;
    const found = await User.findOne({ loginName });
    console.log(loginName, req.body.password);
    if (found) {
      return res
        .status(400)
        .json({ message: "User with this login name already exists" });
    }
    const newUser = new User({
      loginName: req.body.loginName,
      password: req.body.password,
    });

    await newUser.save();

    const createdUser = await User.findOne({ loginName });

    if (createdUser) {
      res.status(200).json(createdUser);
    } else {
      res
        .status(500)
        .json({ message: "User created but failed to retrieve user info" });
    }
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
  return null;
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
app.get("/transactionHistory", (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  Transaction.find({
    $or: [{ senderUserId: userId }, { receiverUserId: userId }],
  })
    .then((transactions) => {
      const modifiedTransactions = transactions.map((transaction) => {
        if (transaction.senderUserId.toString() === userId) {
          return { ...transaction._doc, type: "expense" };
        } else if (transaction.receiverUserId.toString() === userId) {
          return { ...transaction._doc, type: "income" };
        }
      });
      res.json(modifiedTransactions);
    })
    .catch((err) => {
      console.error("Error fetching transactions:", err);
      res.status(500).json({ error: "Failed to fetch transactions" });
    });
});

app.post("/transfer", async (req, res) => {
  try {
    console.log(req.body);
    const {
      senderAccount,
      recipientName,
      recipientBank,
      recipientAccount,
      description,
      amount,
      currency,
      receiverUserId,
      transactionPassword,
    } = req.body;
    const senderUserId = req.session.userId;

    const transferAmount = parseFloat(amount);

    const user = await User.findOne({ _id: senderUserId });
    if (transactionPassword !== user.transactionPassword) {
      console.log("Transaction password didn't match");
      return res.status(404).json("Transaction password ");
    }
    const receiver = await Account.findOne({
      bankId: recipientBank,
      accountNumber: recipientAccount,
    });
    if (!receiver) {
      console.log("Recipient account not found");
      return res.status(404).json("Recipient");
    }
    const sender = await Account.findOne({ accountNumber: senderAccount });
    if (sender.balance < transferAmount) {
      console.log("Insufficient funds");
      return res.status(400).json("Balance");
    }

    sender.balance -= transferAmount;
    receiver.balance += transferAmount;

    await sender.save();
    await receiver.save();

    const newTransaction = new Transaction({
      senderAccount,
      recipientName,
      recipientBank,
      recipientAccount,
      description,
      amount: transferAmount,
      currency,
      senderUserId,
      receiverUserId,
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
  const userId = req.session.userId;
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

    res.status(200).json({
      userAccounts: userAccountsFormatted,
      accounts: accountsFormatted,
      banks,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
app.get("/getPersonalAccounts", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const accounts = await Account.find({ userId }).lean();

  const extractUsername = async (account) => {
    const user = await User.findOne({ _id: account.userId }).lean();
    return { ...account, username: user.firstName + " " + user.lastName };
  };

  const accountsFormatted = await Promise.all(accounts.map(extractUsername));
  if (accountsFormatted) {
    res.status(200).json(accountsFormatted);
  } else {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});
/*
const makePasswordHashed = async () => {
  try {
    const users = await User.find({});
    users.map(async (user) => {
      const hashedPassword = crypto
        .createHash("sha256")
        .update(user.password + user.salt) // Include salt in the password before hashing
        .digest("hex");

      const hashedTransactionPassword = crypto
        .createHash("sha256")
        .update(user.transactionPassword + user.salt) // Include salt in the transaction password before hashing
        .digest("hex");

      // Update the user's hashed passwords in the database
      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        transactionPassword: hashedTransactionPassword,
      });
    });
  } catch (err) {
    console.error("Error hashing passwords:", err);
  }
};

makePasswordHashed();*/
