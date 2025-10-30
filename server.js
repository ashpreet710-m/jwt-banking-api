const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

// Secret key for signing JWT
const SECRET_KEY = "myjwtsecret";

// Simulated user credentials
const USER = { username: "user1", password: "password123" };

// Simulated account balance
let accountBalance = 1000;

// ---------------------------
// Middleware to verify JWT
// ---------------------------
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or incorrect" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // store decoded user info
    next();
  });
}

// ---------------------------
// POST /login
// ---------------------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({ token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// ---------------------------
// GET /balance (Protected)
// ---------------------------
app.get("/balance", verifyToken, (req, res) => {
  res.status(200).json({ balance: accountBalance });
});

// ---------------------------
// POST /deposit (Protected)
// ---------------------------
app.post("/deposit", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid deposit amount" });
  }
  accountBalance += amount;
  res.status(200).json({ message: `Deposited $${amount}`, newBalance: accountBalance });
});

// ---------------------------
// POST /withdraw (Protected)
// ---------------------------
app.post("/withdraw", verifyToken, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid withdrawal amount" });
  }
  if (amount > accountBalance) {
    return res.status(400).json({ message: "Insufficient balance" });
  }
  accountBalance -= amount;
  res.status(200).json({ message: `Withdrew $${amount}`, newBalance: accountBalance });
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Banking API server running at http://localhost:${PORT}`);
});
