const logger = require('../src/core/logger')('api');
const { Bank } = require('../src/models');
const { hashPin } = require('../src/utils/pin');

const name = 'Administrator';
const email = 'admin@example.com';
const pin = '123456';

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

    const hashedPin = await hashPin(pin);
    await Bank.create({
      name,
      email,
      pin: hashedPin,
    });
  } catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
})();
