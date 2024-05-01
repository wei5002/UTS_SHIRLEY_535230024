const { Bank } = require('../../../models');

/**
 * Get bank by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getBankByEmail(email) {
  return Bank.findOne({ email });
}

module.exports = {
  getBankByEmail,
};
