const banksRepository = require('./banks-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of banks
 * @param {string} sort         - bank sort 
 * @param {string} search       - bank search 
 * @param {string} page_size    - bank page size
 * @param {string} page_number  - bank page number
 * @returns {Array}
 */
async function getBanks(sort, search, page_size, page_number) {
  const banks = await banksRepository.getBanks(sort);

  if(search){
    const [searchFieldName, search_key] = search.split(':');

    if(searchFieldName !=='name' && searchFieldName !== 'email'){
      throw new Error ('Field name hanya bisa dimasukkan "name" atau "email" saja');
    }

    const hasilSearch = banks.filter(bank=>{ //membuat array baru dengan filter
      const nilaiField = bank[searchFieldName].toUpperCase();
      // toUpperCase untuk mengonversi kedua nilai menjadi huruf besar 
      const nilaiSearch = search_key.toUpperCase();
      return nilaiField.includes(nilaiSearch);
      // includes biar tidak menjadi case sensitive(unsensitif)
    });
    banks = hasilSearch;
  }

  if(page_size && page_number){
    if(!Number.isInteger(page_size)|| page_size<1 || !Number.isInteger(page_number)||page_number<1){
      throw new Error(
        'page sizenya sama page number harus bilangannya integer positid'
      );
    }

    // menentukan indeks awal array dari potogan data yang diambil
    const awalArray =(page_number-1)*page_size;
    
    // menghitung indeks akhir dari potongan data yang akan diambil
    const akhirArray = page_number*page_size;

    banks=banks.slice(awalArray,akhirArray);
    // mengambil data dari pengguna banks mulai dari indeks awalArray hingga sebelum akhirarray
  }

  const results = [];
  banks.forEach(bank=> {
        results.push({
      id: bank.id,
      name: bank.name,
      email: bank.email,
  });
});
  

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
    name: bank.name,
    email: bank.email,
  };
}

/**
 * Create new bank
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - password
 * @returns {boolean}
 */
async function createBank(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await banksRepository.createBank(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing bank
 * @param {string} id - Bank ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateBank(id, name, email) {
  const bank = await banksRepository.getBank(id);

  // Bank not found
  if (!bank) {
    return null;
  }

  try {
    await banksRepository.updateBank(id, name, email);
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

module.exports = {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
