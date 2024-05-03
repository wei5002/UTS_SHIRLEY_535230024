const { required } = require("joi");

const banksSchema = {
  nomorRekening :{type: String, required: true},
  name: String,
  jenisKelamin: String,
  noPhone: String,
  email: String,
  address: String,
  password: String,
};

module.exports = banksSchema;
