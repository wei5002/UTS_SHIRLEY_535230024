const express = require('express');

const authenticationControllers = require('./authenticationBanks-controller');
const authenticationValidators = require('./authenticationBanks-validator');
const celebrate = require('../../../core/celebrate-wrappers');

const route = express.Router();

module.exports = (app) => {
  app.use('/authenticationBanks', route);

  route.post(
    '/login',
    celebrate(authenticationValidators.login),
    authenticationControllers.login
  );
};
