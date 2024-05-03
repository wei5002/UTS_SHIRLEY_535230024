const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const { password, address } = require('../../../models/banks-schema');
const { changePassword } = require('../banks/banks-validator');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createBank: {
    body: {
      noKTP: joi.string().min(16).max(16).required().label('Nomor KTP'),
      name: joi.string().min(1).max(100).required().label('Name'),
      jenisKelamin: joi.string().required().label('Jenis Kelamin (P/L)'),
      noPhone: joi.string().min(11).max(13).required().label('Nomor Telepon'),
      email: joi.string().email().required().label('Email'),
      address: joi.string().required().label('Address'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  updateBank: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      jenisKelamin: joi.string().required().label('Jenis Kelamin'),
      noPhone: joi.string().required().label('Nomor Telepon'),
      email: joi.string().email().required().label('Email'),
      address: joi.string().required().label('Address'),
    },
  },

  changePassword: {
    body: {
      password_old: joi.string().required().label('Old password'),
      password_new: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('New password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },
};
