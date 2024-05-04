const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

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
    //jika tidak terdapapat jumlah gagal atau berhasil login, maka kesemula dari 0 gagal lagi, hingga ia mendapatkan kegagalan 5 kali baru ke if di bawahnya 
    if (!jumlahGagal[email]){
      jumlahGagal[email]={
        awalLogin:0,
        akhirLogin: null,
      };
    }

    // jadi jika kegagalannya lebih dari 5  kali dan belum setelah 30 menit, ia akan mendapatkan teks Too many failed login attempts 
    if (jumlahGagal[email].awalLogin>= 5 && Date.now()- jumlahGagal[email].akhirLogin < 1800000){
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

    // ini seperti yang di atas ( if (!gagalogin))
    if (loginSuccess) {
      jumlahGagal[email].awalLogin = 0;
      jumlahGagal[email].akhirLogin= null;
    return response.status(200).json(loginSuccess);      
    }
    
    // jika terdapat gagal login, maka awalLogin akan terus di tambahkan 1 dari waktu yang sekrang ini, jika telah mencapai 5 kali awalLoginnya, maka akan
    // menuju ke if yang atasnya dengan mengurangin waktu terakhir login +30 menit
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
