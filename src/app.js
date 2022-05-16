const express = require("express");
const app = express();
const pastes = require("./data/pastes-data");
const pastesRouter = require("./pastes/pastes.router");

// Built-in middleware that adds a body property to the request (req.body)
/* This must come before any handlers that use the JSON in the body request */
app.use(express.json());
 
app.use("/pastes", pastesRouter); // Note: app.use

// Not found handler
app.use((request, response, next) => {
  next({
    status: 404,
    message: `Not found: ${request.originalUrl}`,
  });
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  // Return '500 Internal Server Error' by default
  const { status = 500, message = "Something went wrong..." } = error;
  response.status(status).json({ error: message });
});

module.exports = app;
