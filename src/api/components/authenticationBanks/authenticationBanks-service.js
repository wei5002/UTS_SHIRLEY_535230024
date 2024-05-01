const authenticationRepository = require('./authenticationBanks-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const bank = await authenticationRepository.getBankByEmail(email);

  // We define default bank password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the bank login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const bankPassword= bank ? bank.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, bankPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `bank` is found (by email) and
  // the password matches.
  if (bank && passwordChecked) {
    return {
      email: bank.email,
      name: bank.name,
      bank_id: bank.id,
      token: generateToken(bank.email, bank.id),
    };
  }

  return null;
}

module.exports = {
  checkLoginCredentials,
};
