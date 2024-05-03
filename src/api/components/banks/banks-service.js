const banksRepository = require('./banks-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { address } = require('../../../models/banks-schema');

/**
 * Get list of banks
 * @returns {Array}
 */
async function getBanks() {
  const banks = await banksRepository.getBanks();

  const results = [];
  for (let i=0; i<banks.length; i +=1){
    const bank = banks[i];
    results.push({
      id: bank.id,
      nomorRekening: bank.nomorRekening,
      noKTP: bank.noKTP,
      name: bank.name,
      jenisKelamin: bank.jenisKelamin,
      noPhone: bank.noPhone,
      email: bank.email,
      address: bank.address,
  });
}
  return results;
}

/**
 * Get bank detail
 * @param {string} id - Bank ID
 * @returns {Object}
 */
async function getBank(id) {
  const bank = await banksRepository.getBank(id);

  // Bank not found
  if (!bank) {
    return null;
  }

  return {
    id: bank.id,
    noKTP : bank.noKTP,
    nomorRekening: bank.nomorRekening,
    name: bank.name,
    jenisKelamin: bank.jenisKelamin,
    noPhone: bank.noPhone,
    email: bank.email,
    address: bank.address,
  };
}

/**
 * Create new bank
 * @param {string} nomorRekening  - Nomor rekening
 * @param {string} noKTP          - Nomor KTP
 * @param {string} name           - Name
 * @param {string} jenisKelamin   - Jenis kelamin
 * @param {string} noPhone        - nomor telepon
 * @param {string} email          - Email
 * @param {string} address        - Address
 * @param {string} password       - Password
 * @returns {boolean}
 */
async function createBank(nomorRekening, noKTP, name, jenisKelamin, noPhone, email, address, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await banksRepository.createBank(nomorRekening, noKTP, name, jenisKelamin, noPhone, email, address, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing bank
 * @param {string} id           - Bank ID
 * @param {string} name         - Name
 * @param {string} email        - Email
 * @param {string} address      - address
 * @returns {boolean}
 */
async function updateBank(id, name, email, address) {
  const bank = await banksRepository.getBank(id);

  // Bank not found
  if (!bank) {
    return null;
  }

  try {
    await banksRepository.updateBank(id, name, email, address);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete bank
 * @param {string} id - Bank ID
 * @returns {boolean}
 */
async function deleteBank(id) {
  const bank = await banksRepository.getBank(id);

  // Bank not found
  if (!bank) {
    return null;
  }

  try {
    await banksRepository.deleteBank(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const bank = await banksRepository.getBankByEmail(email);

  if (bank) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} bankId - Bank ID
 * @param {string} password - password
 * @returns {boolean}
 */
async function checkPassword(bankId, password) {
  const bank = await banksRepository.getBank(bankId);
  return passwordMatched(password, bank.password);
}

/**
 * Change bank password
 * @param {string} bankId - bank ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(bankId, password) {
  const bank = await banksRepository.getBank(bankId);

  // Check if bank not found
  if (!bank) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await banksRepository.changePassword(
    bankId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

//merupakan fungsi yang digunakan untukk membuat angka secara random dengan jumlah 10 yang digunakan sebagai nomor rekening customer
async function getRekening(){
  try{
    const randomNumber = Math.floor(1000000000 + Math.random()*9000000000);
    const nomorRekening = randomNumber.toString();

    return nomorRekening;
  } catch(error){
    throw new Error ('Perbuatan nomor rekening tidak berhasil')
  }
}

module.exports = {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  emailIsRegistered,
  checkPassword,
  changePassword,
  getRekening,
};
