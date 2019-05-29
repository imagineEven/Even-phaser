class NotFunctionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFunctionError';
  }
}

export {
  NotFunctionError
};