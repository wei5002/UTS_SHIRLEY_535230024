const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');

// const authenticationBanks = require('./components/authenticationBanks/authenticationBanks-route');
const banks = require('./components/banks/banks-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);

  // authenticationBanks(app);
  banks(app);

  return app;
};
