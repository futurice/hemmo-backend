exports.seed = async knex => {
  const organisationFields = [
    {
      name: 'Province 1',
      leftId: 1,
      rightId: 6,
    },
    {
      name: 'City 1.1',
      leftId: 2,
      rightId: 5,
    },
    {
      name: 'Unit 1.1.1',
      leftId: 3,
      rightId: 4,
    },
    {
      name: 'Procince 2',
      leftId: 7,
      rightId: 8,
    },
    {
      name: 'Province 3',
      leftId: 9,
      rightId: 12,
    },
    {
      name: 'City 3.1',
      leftId: 10,
      rightId: 11,
    }
  ];

  return knex.batchInsert('organisation', organisationFields, 1);
};
