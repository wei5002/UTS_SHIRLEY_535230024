const logger = require('../src/core/logger')('api');
const { Bank } = require('../src/models');
const { hashPassword } = require('../src/utils/password');

const name = 'Administrator';
const email = 'admin@example.com';
const password = '123456';

logger.info('Creating default banks');

(async () => {
  try {
    const numBanks = await Bank.countDocuments({
      name,
      email,
    });

    if (numBanks > 0) {
      throw new Error(`Bank ${email} already exists`);
    }

    const hashedPassword = await hashPassword(password);
    await Bank.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
})();
