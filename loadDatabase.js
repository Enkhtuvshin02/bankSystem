import mongoose from "mongoose";
import User from "./models/user.js";
import Bank from "./models/bank.js";
import Account from "./models/account.js";
import Transaction from "./models/transaction.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
// Connect to MongoDB
mongoose
  .connect(
    process.env.DB_URI,
    { dbName: "bankSystem" },
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const loadDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Bank.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});

    // Create sample banks
    const banks = await Bank.insertMany([
      { name: "Bank A", location: "New York" },
      { name: "Bank B", location: "Los Angeles" },
      { name: "Bank C", location: "Chicago" },
    ]);

    // Create sample users with the updated schema
    const users = await User.insertMany([
      {
        firstName: "John",
        lastName: "Doe",
        loginName: "johndoe",
        salt: crypto.randomBytes(8).toString("hex"),
        password: "1234",
        transactionPassword: "1234",
      },
      {
        firstName: "Jane",
        lastName: "Doe",
        loginName: "janedoe",
        salt: crypto.randomBytes(8).toString("hex"),
        password: "1234",
        transactionPassword: "1234",
      },
      {
        firstName: "Jim",
        lastName: "Beam",
        loginName: "jimbeam",
        salt: crypto.randomBytes(8).toString("hex"),
        password: "1234",
        transactionPassword: "1234",
      },
      {
        firstName: "Jack",
        lastName: "Daniels",
        loginName: "jackdaniels",
        salt: crypto.randomBytes(8).toString("hex"),
        password: "1234",
        transactionPassword: "1234",
      },
      {
        firstName: "Johnny",
        lastName: "Walker",
        loginName: "johnnywalker",
        salt: crypto.randomBytes(8).toString("hex"),
        password: "1234",
        transactionPassword: "1234",
      },
    ]);

    // Create sample accounts (some users with multiple accounts in the same bank)
    const accounts = await Account.insertMany([
      {
        userId: users[0]._id,
        accountType: "USD",
        accountNumber: "1234567890",
        balance: 1000,
        bankId: banks[0]._id,
      },
      {
        userId: users[0]._id,
        accountType: "CAD",
        accountNumber: "1234567891",
        balance: 2000,
        bankId: banks[0]._id,
      },
      {
        userId: users[1]._id,
        accountType: "JPY",
        accountNumber: "0987654321",
        balance: 2000,
        bankId: banks[1]._id,
      },
      {
        userId: users[2]._id,
        accountType: "CAD",
        accountNumber: "1122334455",
        balance: 3000,
        bankId: banks[2]._id,
      },
      {
        userId: users[3]._id,
        accountType: "USD",
        accountNumber: "2233445566",
        balance: 4000,
        bankId: banks[0]._id,
      },
      {
        userId: users[4]._id,
        accountType: "JPY",
        accountNumber: "3344556677",
        balance: 5000,
        bankId: banks[1]._id,
      },
      {
        userId: users[4]._id,
        accountType: "CAD",
        accountNumber: "3344556678",
        balance: 6000,
        bankId: banks[1]._id,
      },
    ]);

    // Create sample transactions between users in the database with matching account types
    const transactions = await Transaction.insertMany([
      {
        senderAccount: accounts[0].accountNumber,
        recipientName: `${users[3].firstName} ${users[3].lastName}`,
        recipientBank: banks[0]._id,
        recipientAccount: accounts[4].accountNumber,
        description: "Payment for services",
        amount: 100,
        currency: "USD",
        senderUserId: users[0]._id,
        receiverUserId: users[3]._id,
      },
      {
        senderAccount: accounts[1].accountNumber,
        recipientName: `${users[2].firstName} ${users[2].lastName}`,
        recipientBank: banks[2]._id,
        recipientAccount: accounts[3].accountNumber,
        description: "Gift",
        amount: 200,
        currency: "CAD",
        senderUserId: users[0]._id,
        receiverUserId: users[2]._id,
      },
      {
        senderAccount: accounts[2].accountNumber,
        recipientName: `${users[4].firstName} ${users[4].lastName}`,
        recipientBank: banks[1]._id,
        recipientAccount: accounts[5].accountNumber,
        description: "Loan repayment",
        amount: 300,
        currency: "JPY",
        senderUserId: users[1]._id,
        receiverUserId: users[4]._id,
      },
      {
        senderAccount: accounts[5].accountNumber,
        recipientName: `${users[1].firstName} ${users[1].lastName}`,
        recipientBank: banks[1]._id,
        recipientAccount: accounts[2].accountNumber,
        description: "Purchase",
        amount: 150,
        currency: "JPY",
        senderUserId: users[4]._id,
        receiverUserId: users[1]._id,
      },
      {
        senderAccount: accounts[3].accountNumber,
        recipientName: `${users[4].firstName} ${users[4].lastName}`,
        recipientBank: banks[1]._id,
        recipientAccount: accounts[6].accountNumber,
        description: "Transfer",
        amount: 250,
        currency: "CAD",
        senderUserId: users[2]._id,
        receiverUserId: users[4]._id,
      },
      {
        senderAccount: accounts[4].accountNumber,
        recipientName: `${users[0].firstName} ${users[0].lastName}`,
        recipientBank: banks[0]._id,
        recipientAccount: accounts[0].accountNumber,
        description: "Payment",
        amount: 350,
        currency: "USD",
        senderUserId: users[3]._id,
        receiverUserId: users[0]._id,
      },
    ]);

    console.log("Sample data inserted successfully");
  } catch (err) {
    console.error("Error inserting sample data", err);
  } finally {
    mongoose.connection.close();
  }
};

loadDatabase();
