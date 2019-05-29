class NotGameError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotGameError';
  }
}

export {
  NotGameError
};