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
    console.log("=== SUCCESS RESPONSE SEND START ===");
    console.log("Status code:", this.statusCode);
    console.log("Message:", this.message);
    console.log("Data type:", typeof this.data);
    console.log("Data keys:", this.data ? Object.keys(this.data) : 'null/undefined');
    
    try {
      const responseData = {
        message: this.message,
        status: this.statusCode,
        data: this.data,
      };
      
      console.log("Response data structure:", JSON.stringify(responseData, null, 2));
      console.log("Sending JSON response...");
      
      res.status(this.statusCode).json(responseData);
      
      console.log("=== SUCCESS RESPONSE SEND SUCCESS ===");
    } catch (error) {
      console.error("=== SUCCESS RESPONSE SEND ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Failed data:", this.data);
      throw error;
    }
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
