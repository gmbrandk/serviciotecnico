class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}

class DuplicateError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'DuplicateError';
    this.status = 409;
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.details = details;
  }
}

module.exports = {
  ValidationError,
  DuplicateError,
  NotFoundError,
};
