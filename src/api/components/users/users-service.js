const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @param {string} sort         - user sort 
 * @param {string} search       - user search 
 * @param {string} page_size    - user page size
 * @param {string} page_number  - user page number
 * @returns {Array}
 */
async function getUsers(sort, search, page_size, page_number) {
  const users = await usersRepository.getUsers(sort);

  if(search){
    const [searchFieldName, search_key] = search.split(':');

    if(searchFieldName !=='name' && searchFieldName !== 'email'){
      throw new Error ('Field name hanya bisa dimasukkan "name" atau "email" saja');
    }

    const hasilSearch = users.filter(user=>{ //membuat array baru dengan filter
      const nilaiField = user[searchFieldName].toUpperCase();
      // toUpperCase untuk mengonversi kedua nilai menjadi huruf besar 
      const nilaiSearch = search_key.toUpperCase();
      return nilaiField.includes(nilaiSearch);
      // includes biar tidak menjadi case sensitive(unsensitif)
    });
    users = hasilSearch;
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

    users=users.slice(awalArray,akhirArray);
    // mengambil data dari pengguna users mulai dari indeks awalArray hingga sebelum akhirarray
  }

  const results = [];
  users.forEach(user=> {
        results.push({
      id: user.id,
      name: user.name,
      email: user.email,
  });
});
  

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
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
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
