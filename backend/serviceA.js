import express from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT = 4001;
const app = express();
// AUTH_SERVICE_URL here for ease of use, instead of using the longer "process.env.AUTH_SERVICE_URL" every time
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:4000";

let accessToken = null;
let refreshToken = null;

// Simple verify endpoint
app.get("/", (req, res) => {
  res.send("Service A is running.");
});

// Getting data from Service B
app.get("/data", async (req, res) => {
  let result = await fetch(`http://localhost:4003/bids`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Try to refresh the access token if expired
  if (!result.ok && result.status === 401) {
    console.log("Access token expired, attempting to refresh...");
    const refreshResult = await fetch(`${AUTH_SERVICE_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (refreshResult.ok) {
      const refreshData = await refreshResult.json();
      accessToken = refreshData.accessToken;
      console.log("Access token refreshed.");

      console.log(
        "Retrying data fetch from Service B with new access token..."
      );
      result = await fetch("http://localhost:4003/bids", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } else {
      console.log("Failed to refresh access token. Skipping data fetch retry.");
    }
  }

  if (!result.ok) {
    return res
      .status(500)
      .json({ error: "Failed to fetch data from Service B." });
  }

  const data = await result.json();
  res.json({ data });
});

app.listen(PORT, () => {
  console.log(`Service A is running on port ${PORT}`);

  console.log(`Getting JWT from Auth Service at ${AUTH_SERVICE_URL}`);

  // TODO: use a wrapper function to get JWT and refresh key (prevent concurrency issues)
  // Fetch JWT and refresh token from Auth Service
  fetch(`${AUTH_SERVICE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "service A",
      password: "pass",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Received JWT from Auth Service:", data);
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
    })
    .catch((err) => {
      console.error("Error fetching JWT from Auth Service:", err);
    });
});
