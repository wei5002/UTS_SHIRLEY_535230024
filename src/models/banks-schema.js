const { required } = require("joi");

const banksSchema = {
  nomorRekening :{type: String, required: true},
  noKTP: String,
  name: String,
  jenisKelamin: String,
  tempatLahir:String,
  tanggalLahir: String,
  noPhone: String,
  email: String,
  address: String,
  password: String,
};

module.exports = banksSchema;
