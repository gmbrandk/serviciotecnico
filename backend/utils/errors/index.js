// backend/utils/erros/index.js
class ValidationError extends Error {
  constructor(message, details = null) {
    if (typeof message === 'object' && message !== null) {
      super(message.message || 'Error de validación');
      this.details = message.details || message.clienteExistente || null;
      this.code = message.code || 'VALIDATION_ERROR';
    } else {
      super(message);
      this.details = details;
      this.code = 'VALIDATION_ERROR';
    }

    this.name = 'ValidationError';
    this.status = 400;
  }
}

class DuplicateError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'DuplicateError';
    this.status = 400;
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
