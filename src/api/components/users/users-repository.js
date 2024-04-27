const { errorResponder, errorTypes } = require('../../../core/errors');
const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers(sort,search) {
  let users;

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
    users = await User.find(query);
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

    users = await User.find({}).sort(sortApa);
  } else {
    users = await User.find({});
  }
  return users;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
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
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};
