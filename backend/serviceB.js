import express from "express";
import jwtMiddleware from "./utils/getUserFromJwtMiddleware.js";

const PORT = 4003;
const app = express();

// Simple verify endpoint
app.get("/", (req, res) => {
  res.send("Service B is running.");
});

// Protected endpoint to get bids
app.get("/bids", jwtMiddleware, (req, res) => {
  // Get the authenticated service info from req.user
  const service = req.user;
  if (!service) {
    return res
      .status(401)
      .json({ error: "Unauthorized: No valid JWT provided" });
  }
  // Return data if authenticated
  res.json({ message: "Hello from Service B!", bids: [100, 200, 300] });
});

app.listen(PORT, () => {
  console.log(`Service B is running on port ${PORT}`);
});
