const { errorResponder, errorTypes } = require('../../../core/errors');
const { Bank } = require('../../../models');
const { changePassword } = require('./banks-controller');

/**
 * Get a list of banks
 * @param {string}  sort      - banks sort 
 * @param {string}  search    - banks search 
 * @param {string}  page_size - banks page size
 * @param {string}  page_number - banks page number
 * @returns {Promise}
 */
async function getBanks(sort,search, page_size, page_number) {
  let banks;

  const query ={};
  if(search){
    const [searchFieldName, search_key]= search.split(':');

    if(searchFieldName !== 'name' && searchFieldName !== 'email'){
      throw new Error ('Field name hanya bisa dimasukkan "name" atau "email" saja')
    }
    query[searchFieldName]={
      $regex : new RegExp (search_key, 'i') 
      // RegExp untuk mencocokan teks pada pola tertentu
      // i untuk smenjadikan case unsensitif (boleh huruf besar kecil ataupun apa pun itu)
    };
    banks = await Bank.find(query);
  }

  if (sort){
    const [fieldName, sortOrder]= sort.split(':');

    if(fieldName !== 'name' && fieldName !== 'email'){
      throw new Error (
        'Sort order yang dapat diisi hanya "asc" atau "desc" saja'
      );
    }

    const sortApa ={};
    if (sortOrder === 'asc'){
      sortApa[fieldName]=1; //dia akan urutannya naik seperti a b c d duluan 
    }else {
      sortApa[fieldName]=-1; //kebalikannya yaitu turun urutannya 
    }

    banks = await Bank.find(query).sort(sortApa);
  } else {
    banks = await Bank.find(query);
  }

  // memeriksa page_size sama page_number sudah ada belum atau valid belum
  if(page_size && page_number){             
    const pass = (page_number-1)*page_size;   //menghitung indeks awal
    banks= banks.slice(pass,pass+page_size);

    if(banks.length ===0 && pass>0){ // memeriksa banks yang kosong apakah sudah melewati halaman pertama
      //jika terjadi, maka halaman yang memiliki data kosong bukan halaman pertama 
      return await getBanks(sort, search, page_size, page_number-1);
    }
  }
  return banks;
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
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createBank(name, email, password) {
  return Bank.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing bank
 * @param {string} id - Bank ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateBank(id, name, email) {
  return Bank.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
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

// /**
//  * Update bank password
//  * @param {string} id - bank ID
//  * @param {string} password - New hashed password
//  * @returns {Promise}
//  */
// async function changePassword(id, password) {
//   return Bank.updateOne({ _id: id }, { $set: { password } });
// }

module.exports = {
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  getBankByEmail,
  changePassword,
};
