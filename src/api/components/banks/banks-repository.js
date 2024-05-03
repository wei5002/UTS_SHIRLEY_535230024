// const { errorResponder, errorTypes } = require('../../../core/errors');
const { Bank } = require('../../../models');
// const { changePassword } = require('./banks-controller');

/**
 * Get a list of banks
 * @returns {Promise}
 */
async function getBanks() {
  return Bank.find({});
  }

/**
 * Get bank detail
 * @param {string} id - Bank ID
 * @returns {Promise}
 */
async function getBank(id) {
  return Bank.findById(id);
}

/**
 * Create new bank
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} address - address
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createBank(name, email, address, password) {
  return Bank.create({
    name,
    email,
    address,
    password,
    
  });
}

/**
 * Update existing bank
 * @param {string} id - Bank ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} address- address
 * @returns {Promise}
 */
async function updateBank(id, name, email, address) {
  return Bank.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
        address,
      },
    }
  );
}

/**
 * Delete a bank
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteBank(id) {
  return Bank.deleteOne({ _id: id });
}

/**
 * Get bank by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getBankByEmail(email) {
  return Bank.findOne({ email });
}

/**
 * Update bank password
 * @param {string} id - bank ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return Bank.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  getBankByEmail,
  changePassword,
};
