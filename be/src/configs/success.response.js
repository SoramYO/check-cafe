"use strict";
const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");
class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    data = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.data = data;
    this.statusCode = statusCode;
  }

  send(res, headers = {}) {
    res.status(this.statusCode).json({
      message: this.message,
      status: this.statusCode,
      data: this.data,
    });
  }
}

class OK extends SuccessResponse {
  constructor({
    message,
    data,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
  }) {
    super({
      message,
      statusCode,
      reasonStatusCode,
      data,
    });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.CREATED,
    reasonStatusCode = ReasonPhrases.CREATED,
    data,
    options = {},
  }) {
    super({
      message,
      statusCode,
      reasonStatusCode,
      data,
    });
    this.options = options;
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
