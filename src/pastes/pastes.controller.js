const pastes = require("../data/pastes-data");

function list(req, res) {
    res.json({ data: pastes });
}

// Variable to hold the next ID
  // B/c some IDs may already be used, find the largest assigned ID
  let lastPasteId = pastes.reduce((maxId, paste) => Math.max(maxId, paste.id), 0);
// Validation handlers //
function bodyDataHas(propertyName) {
    return function (req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next(); // Move on to 'create'
        }
        next({ status: 400, message: `Must include a ${propertyName}` });
    };
}

function exposurePropertyIsValid(req, res, next) {
    const { data: { exposure } = {} } = req.body;
    const validExposure = ["private", "public"];
    if (validExposure.includes(exposure)) {
        return next();
    }
    next({
        status: 400,
        message: `Value of the 'exposure' property must be one of ${validExposure}. Received: ${exposure}`,
    });
}

function syntaxPropertyIsValid(req, res, next) {
    const { data: { syntax } = {} } = req.body;
    const validSyntax = ["None", "Javascript", "Python", "Ruby", "Perl", "C", "Scheme"];
    if (validSyntax.includes(syntax)) {
      return next();
    }
    next({
      status: 400,
      message: `Value of the 'syntax' property must be one of ${validSyntax}. Received: ${syntax}`,
    });
  }
  
  function expirationIsValidNumber(req, res, next){
    const { data: { expiration }  = {} } = req.body;
    if (expiration <= 0 || !Number.isInteger(expiration)){
        return next({
            status: 400,
            message: `Expiration requires a valid number`
        });
    }
    next();
  }
// Create paste handler //
function create(req, res) {
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
  };


// Read paste handler //
  function pasteExists(req, res, next) {
    const { pasteId } = req.params;
    const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));
    if (foundPaste) {
      return next(); // Move on to 'read'
    }
    next({
      status: 404,
      message: `Paste id not found: ${pasteId}`,
    });
  }

  function read(req, res) {
    const { pasteId } = req.params;
    const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));
    res.json({ data: foundPaste });
  }


  // Update paste handler //
  function update(req, res) {
    const { pasteId } = req.params;
    const foundPaste = pastes.find((paste) => paste.id === Number(pasteId));
    const { data: { name, syntax, expiration, exposure, text } = {} } = req.body;
  
    // Update the paste
    foundPaste.name = name;
    foundPaste.syntax = syntax;
    foundPaste.expiration = expiration;
    foundPaste.exposure = exposure;
    foundPaste.text = text;
  
    res.json({ data: foundPaste });
  }


  // Delete paste handler
  function destroy(req, res) {
    const { pasteId } = req.params;
    const index = pastes.findIndex((paste) => paste.id === Number(pasteId));
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedPastes = pastes.splice(index, 1);
    res.sendStatus(204);
  }


module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("syntax"),
        bodyDataHas("exposure"),
        bodyDataHas("expiration"),
        bodyDataHas("text"),
        bodyDataHas("user_id"),
        exposurePropertyIsValid,
        syntaxPropertyIsValid,
        expirationIsValidNumber,
        create,
    ],
    list,
    read: [pasteExists, read],
    update: [
        pasteExists,
        bodyDataHas("name"),
        bodyDataHas("syntax"),
        bodyDataHas("exposure"),
        bodyDataHas("expiration"),
        bodyDataHas("text"),
        exposurePropertyIsValid,
        syntaxPropertyIsValid,
        expirationIsValidNumber,
        update
    ],
    delete: [pasteExists, destroy],
};