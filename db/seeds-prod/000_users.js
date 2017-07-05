const simpleFixtures = require('simple-fixtures');

const userFields = {
  scope: 'user',
  email: 'internet.email',
  name: 'name.findName',
};

exports.seed = knex => (
  // Generate several test users (no password = login disabled)
  knex.batchInsert('users', simpleFixtures.generateFixtures(userFields, 10))
);
