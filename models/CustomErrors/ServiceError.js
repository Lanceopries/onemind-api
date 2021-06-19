module.exports = class ServiceError extends Error {
    constructor(message, serviceName) {
      super(message);
      this.serviceName = serviceName;
      this.name = "serviceError";
    }
  }