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

// Session configuration with connect-mongo
app.use(
  session({
    name: "session",
    secret: process.env.SESSION_SECRET || "secretKey",
    resave: false,
    saveUninitialized: false,
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

const sessionSchema = new mongoose.Schema(
  {},
  { strict: false, collection: "sessions" }
);
const Session = mongoose.model("Session", sessionSchema);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/isLoggedIn", async (req, res) => {
  const sessionCookie = req.cookies.session;
  if (!sessionCookie || !sessionCookie.isLoggedIn) {
    res.json({ isLoggedIn: false });
  } else {
    res.json({
      isLoggedIn: sessionCookie.isLoggedIn,
      username: sessionCookie.username,
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

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password + user.salt)
      .digest("hex");
    if (hashedPassword !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    req.session.isLoggedIn = true;
    req.session.userId = user._id;
    req.session.username = `${user.firstName} ${user.lastName}`;

    res.cookie("session", req.session);
    res.status(200).json({ message: "success", sessionId: req.sessionID });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Failed to log in" });
  }
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
  const sessionCookie = req.cookies.session;
  const userId = sessionCookie.userId;

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
app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Failed to log out" });
    } else {
      res.clearCookie("session", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      return res.status(200).json({ message: "Logged out successfully" });
    }
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
  const sessionCookie = req.cookies.session;
  const userId = sessionCookie.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userAccount = await Account.findOne({ userId: userId });

    const transactions = await Transaction.find({
      $or: [
        { senderAccount: userAccount.accountNumber },
        { recipientAccount: userAccount.accountNumber },
      ],
    });

    const modifiedTransactions = transactions.map((transaction) => {
      if (transaction.senderAccount === userAccount.accountNumber) {
        return { ...transaction._doc, type: "expense" };
      } else if (transaction.recipientAccount === userAccount.accountNumber) {
        return { ...transaction._doc, type: "income" };
      }
    });

    res.json(modifiedTransactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});
app.post("/transfer", async (req, res) => {
  const sessionCookie = req.cookies.session;
  const senderUserId = sessionCookie.userId;

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
  const sessionCookie = req.cookies.session;
  const userId = sessionCookie.userId;
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
  const sessionCookie = req.cookies.session;
  const userId = sessionCookie.userId;
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
