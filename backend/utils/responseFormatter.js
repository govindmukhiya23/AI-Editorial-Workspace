function successResponse(res, data, status = 200) {
  return res.status(status).json({
    success: true,
    data
  });
}

function errorResponse(res, message, status = 500, details = null) {
  const payload = {
    success: false,
    error: message
  };
  if (details) payload.details = details;
  return res.status(status).json(payload);
}

module.exports = {
  successResponse,
  errorResponse
};
