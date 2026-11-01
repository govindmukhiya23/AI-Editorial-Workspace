const mongoose = require('mongoose');
const { errorResponse } = require('../utils/responseFormatter');

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, `Invalid resource identifier: ${id}`, 400);
    }
    next();
  };
}

module.exports = {
  validateObjectId
};
