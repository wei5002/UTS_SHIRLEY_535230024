const banksService = require('./banks-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of banks request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBanks(request, response, next) {
  try {
    const banks = await banksService.getBanks();

    return response.status(200).json(banks);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get bank detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBank(request, response, next) {
  try {
    const bank = await banksService.getBank(request.params.id);

    if (!bank) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 
        'Unknown bank');
    }

    return response.status(200).json(bank);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create bank request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createBank(request, response, next) {
  try {
    // karena biasanya ketika kita ingin membuat sebuah rekening di bank, pastinya akan di mintakan data-data
    // berupa nama, nomor ktp, jenis kelamin, nomor telepon, dan sebagainya.
    const noKTP= request.body.noKTP;
    const name = request.body.name;  
    const jenisKelamin = request.body.jenisKelamin;
    const tempatLahir = request.body.tempatLahir;
    const tanggalLahir = request.body.tanggalLahir;
    const noPhone = request.body.noPhone;
    const email = request.body.email;
    const address = request.body.address;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // jika customer tidak menuliskan sesuai dengan yang di opsi, maka akan muncul error 
    if(jenisKelamin !== "P"  && jenisKelamin !== "L"){
      throw errorResponder(
        errorTypes.VALIDATION,
        'Pilihlah jenis kelamin (P/L), Jenis kelamin "P" (Perempuan) dan "L" (Laki-laki).'
      );
    }

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await banksService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // membuat nomor rekeningg 
    const nomorRekening = await banksService.getRekening()

    const success = await banksService.createBank(
      nomorRekening,
      noKTP,
      name,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      noPhone,
      email,
      address,
      password,
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create password'
      );
    }

    return response.status(200).json({ nomorRekening, noKTP, name, jenisKelamin, tempatLahir, tanggalLahir, noPhone, email, address });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update bank request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateBank(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const noPhone = request.body.noPhone;    
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await banksService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await banksService.updateBank(id, name, noPhone, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update bank'
      );
    }

    return response.status(200).json({ id, name, noPhone, email, message :"Update success!!" });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete bank request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteBank(request, response, next) {
  try {
    const id = request.params.id;

    const success = await banksService.deleteBank(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete bank'
      );
    }

    return response.status(200).json({ id, message:"Delete Success!" });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change bank password request
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
        'password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await banksService.checkpassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await banksService.changePassword(
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
  getBanks,
  getBank,
  createBank,
  updateBank,
  deleteBank,
  changePassword,
};
