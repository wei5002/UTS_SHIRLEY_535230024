const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    let sortUsers = await usersService.getUsers(request.query.sort);
    if(!sortUsers){
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknow Users'
      );
    }
    
    const search = request.query.search||null;
    if(search){
      const[searchFieldName, search_key]= search.split(':');
      // split ini untuk kalau misalkan kita mau panggil si data nya, maka hanya memngetik namadata : namaorangnya
      
      if (searchFieldName !== 'name' && searchFieldName!=='email'){
        throw errorResponder(
          errorTypes.VALIDATION,
          'Field name harus diisikan dengan "name" atau "email" saja '
        );
      }

      sortUsers = sortUsers.filter(user =>{ // filter untuk membuat array baru yang berisi elemen yang baru atau yang kita inginkan
        return user [searchFieldName].includes(search_key);
        // includes untuuk memeriksa apakah nama atau string yang di cari mengandung search_key, jika iya maka kana keluarkan hasil tersebut 
      });
    }

    const sort = request.query.sort||null;
    if(sort){
      const [fieldName, sortOrder]= sort.split(':');

      if(fieldName !== 'name' && fieldName !== 'email'){
        throw errorResponder(
          errorTypes.VALIDATION,
          'Sort order yang dapat diisi hanya asc atau desc saja'
        );
      }

      sortUsers.sort((a, b)=>{
        if(sortOrder === 'asc'){
          return a[fieldName].localeCompare(b[fieldName]);
          //localeCompare untuk membandingkan antara nama a dengan nama b untuk nanti di urutkan 
        } else if (sortOrder === 'desc'){
          return b[fieldName].localeCompare(a[fieldName]);
        }
      });

    }
      const page_number = parseInt(request.query.page_number) || 1;
      const page_size = parseInt (request.query.page_size) ||10;
      //parseInt = untuk mengubah string menjadi  bilangan integer

      const total_users = sortUsers.length;
      const total_page = Math.ceil(total_users/page_size);
      //ceil buat pembulatan bilangan ke arah yang lebih besar seperti dari 4,2 jadi 5 page gitu.

      //jika page_numbernya tidak ada data atau <1, maka dia akan tetep memunculkan page 1
      if(page_number < 1 || !Number.isInteger(page_number)){
        page_number = 1;
      }

      // karna total page sudah diketahui jika page numbernya lebih besar, maka page numbernya akan menjadi total page
      if(page_number > total_page){
        page_number= total_page;
      }

      // awal penggambilan ini untuk menghitung indeks pertama dari data yang akan di ambil
      // misalkan page_number =1 dan page_size =10, maka indeks awal yang di ambil adalah data yangindeks 0
      // jika page_number =2 maka ambil indeks ke 10
      const awalPengambilan = (page_number - 1 ) * page_size; 
      const akhirPengambilan = awalPengambilan + page_size;
      // ini sama seperti awalPengambilan, cuman ini akhirPengambilan, 
      // jadi misalkan page_number =10 page_size =10, maka indeks akhir akanmenjadi 10.
      // jika page_number =2 maka indeks akhir adalah 20

      // mengambil potongan dari sortUsers yang sudah di urutkan berdasarkan indeks awal hingga akhir
      const hasil = sortUsers.slice (awalPengambilan, akhirPengambilan);

      // jika masih terdapat page_number atau > 1 (2) maka hasilnya akan menjadi True, jika dia pas 1 maka hasilnya akan menjadi False
      const has_previous_page = page_number > 1;
      const has_next_page = page_number< total_page;
      // jika page_number < total_page, seperti jika total page 4 dan page_number 3 artinya 3<4 artinya True, sebaliknya juga 

      // untuk pemanggilan data data yang di atas
      const seluruhData ={
        page_number : page_number,
        page_size : page_size,
        count: hasil.length,
        total_page: total_page,
        has_previous_page: has_previous_page,
        has_next_page: has_next_page,
        data : hasil
      }

    return response.status(200).json(seluruhData);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
