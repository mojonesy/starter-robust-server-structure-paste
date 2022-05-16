const express = require("express");
const app = express();
const pastes = require("./data/pastes-data");
const pastesRouter = require("./pastes/pastes.router");

// Built-in middleware that adds a body property to the request (req.body)
/* This must come before any handlers that use the JSON in the body request */
app.use(express.json());


// Return a data object from the pasteId param
app.use("/pastes/:pasteId", (req, res, next) => {
  const { pasteId } = req.params;
  const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));

  if (foundPaste) {
    res.json({ data: foundPaste });
  } else {
    // The 'next' call passes an object with 'status' and 'message' arguments to the error handler
    next({
      status: 404,
      message: `Paste id not found: ${pasteId}`
    });
  }
});
 
// Pastes handler - only called if incoming request is GET
app.get("/pastes", (req, res) => {
  // Return an object with a "data" property, with a value of the pastes array
  res.json({ data: pastes });
});


// New middleware function to validate the request body
function bodyHasTextProperty(req, res, next) {
  const { data: { text } = {} } = req.body;
  if (text) {
    return next(); // Call 'next()' without error message if text exists
  }
  next({
    status: 400,
    message: "A 'text' property is required.",
  });
}

// Variable to hold the next ID
// B/c some IDs may already be used, find the largest assigned ID
let lastPasteId = pastes.reduce((maxId, paste) => Math.max(maxId, paste.id), 0);

app.post(
  "/pastes",
  bodyHasTextProperty, // Add validation middleware function
  (req, res) => {
    // Route handler no longer has validation code here.
    const { data: { name, syntax, exposure, expiration, text, user_id } = {} } = req.body;
      const newPaste = {
        id: ++lastPasteId, // Increment last ID, then assign it as the current ID
        name,
        syntax,
        exposure,
        expiration,
        text,
        user_id,
      };
      pastes.push(newPaste);
      // Return status "CREATED" when paste is created successfully
      res.status(201).json({ data: newPaste });
});


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
