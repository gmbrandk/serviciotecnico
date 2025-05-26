// utils/httpResponse.js

const sendResponse = (
  res,
  { status = 500, success = false, message, details = null }
) => {
  const payload = { success, message };
  if (details) payload.details = details;
  return res.status(status).json(payload);
};

const sendError = (res, status, message, details = null) =>
  sendResponse(res, { status, success: false, message, details });

const sendSuccess = (res, status, message, details = null) =>
  sendResponse(res, { status, success: true, message, details });

module.exports = {
  sendResponse,
  sendError,
  sendSuccess,
};
