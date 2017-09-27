const faker = require('faker');

// 'foobar'
const dummyPassword =
  '$2a$10$jqtfUwulMw6xqGUA.IsjkuAooNkAjPT3FJ9rRiUoSTsUpNTD8McxC';

exports.seed = knex =>
  knex('employees')
    // Generate one initial admin employee
    .insert(
      [
        {
          id: faker.random.uuid,
          email: 'teppo.testi@pelastakaalapset.fi',
          name: 'Teppo Testi',
          scope: 'admin',
          active: true,
        },
      ],
      'id',
    )
    // Set admin password to 'foobar'
    .then(ids => {
      const fields = ids.map(id => ({
        ownerId: id,
        password: dummyPassword,
      }));

      return knex('secrets').insert(fields);
    });
