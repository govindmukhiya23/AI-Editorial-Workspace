const mongoose = require('mongoose');
const { errorResponse } = require('../utils/responseFormatter');

function validateObjectId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    // In Mongoose connected mode: check isValid; in memory fallback: allow memory IDs
    if (!id || (mongoose.connection.readyState === 1 && !mongoose.Types.ObjectId.isValid(id) && !id.includes('_'))) {
      return errorResponse(res, `Invalid resource identifier: ${id}`, 400);
    }
    next();
  };
}

module.exports = {
  validateObjectId
};
