const simpleFixtures = require('simple-fixtures');

const employeeFields = {
  scope: 'employee',
  email: 'internet.email',
  name: 'name.findName',
};

exports.seed = knex => (
  // Generate several test employees (no password = login disabled)
  knex.batchInsert('employees', simpleFixtures.generateFixtures(employeeFields, 10))
);
