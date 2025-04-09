"use strict";

const accessService = require("../services/access.service");

class AccessController {
  signUp = async (req, res, next) => {
    try {
      console.log("[P] :: signUp", req.body);
      res.status(201).json(await accessService.signUp(req.body));
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      console.log("[P] :: login", req.body);
      res.status(200).json(await accessService.login(req.body));
    } catch (error) {
      next(error);
    }
  };

  userSignUp = async (req, res, next) => {
    try {
      console.log("[P] :: userSignUp", req.body);
      res.status(201).json(await accessService.userSignUp(req.body));
    } catch (error) {
      next(error);
    }
  };

  userLogin = async (req, res, next) => {
    try {
      console.log("[P] :: userLogin", req.body);
      res.status(200).json(await accessService.userLogin(req.body));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AccessController();