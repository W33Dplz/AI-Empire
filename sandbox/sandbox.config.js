// Configuration dédiée à l'isolation stricte des tests en sandbox
module.exports = {
  isolated: true,
  environment: 'sandbox',
  resetMocks: true,
  clearMocks: true,
  restoreMocks: true
};
