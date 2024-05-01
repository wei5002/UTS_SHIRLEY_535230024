const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authenticationBanks-service');

const jumlahGagal ={ }; 
// jumlahGagal --> untuk menampung berapa gagal yang bakal ada saat ketika kita login, 
// atau berapa percobaan saat kita login

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    if (!jumlahGagal[email]){
      jumlahGagal[email]={
        awalLogin:0,
        akhirLogin: null,
      };
    }

    if (jumlahGagal[email].awalLogin>= 5 && Date.now()- jumlahGagal[email].akhirLogin < 60000){
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts.'
      );
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (loginSuccess) {
      jumlahGagal[email].awalLogin = 0;
      jumlahGagal[email].akhirLogin= null;
    return response.status(200).json(loginSuccess);      
    }
    
    jumlahGagal[email].awalLogin += 1;
    jumlahGagal[email].akhirLogin= Date.now();
    throw errorResponder(
      errorTypes.INVALID_CREDENTIALS,
      'Kesalahan email atau password'
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
