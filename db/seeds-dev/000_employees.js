const simpleFixtures = require('simple-fixtures');
const faker = require('faker');

// 'foobar'
const dummyPassword =
  '$2a$10$jqtfUwulMw6xqGUA.IsjkuAooNkAjPT3FJ9rRiUoSTsUpNTD8McxC';

const employeeFields = {
  id: faker.random.uuid,
  scope: 'employee',
  email: faker.internet.email,
  name: faker.name.findName,
  active: () => Math.random() < 0.5,
};

exports.seed = knex =>
  knex('employees')
    // Generate one test admin employee
    .insert(
      {
        ...simpleFixtures.generateFixture(employeeFields),

        email: 'foo@bar.com',
        scope: 'admin',
        active: true,
      },
      'id',
    )
    .then(ids => ids[0]) // Return first (only) employee id
    // Set admin employee password to 'foobar'
    .then(ownerId =>
      knex('secrets').insert({
        ownerId,
        password: dummyPassword,
      }),
    )
    // Generate several test employees (no password = login disabled)
    .then(() =>
      knex.batchInsert(
        'employees',
        simpleFixtures.generateFixtures(employeeFields, 10),
      ),
    );
