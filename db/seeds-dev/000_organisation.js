exports.seed = async knex => {
  const organisationFields = [
    {
      id: 1,
      name: 'Province',
      leftId: 1,
      rightId: 6,
    },
    {
      id: 2,
      name: 'City',
      leftId: 2,
      rightId: 5,
    },
    {
      id: 3,
      name: 'Unit',
      leftId: 2,
      rightId: 4,
    }
  ];

  return knex.batchInsert('organisation', organisationFields, 1);
};
