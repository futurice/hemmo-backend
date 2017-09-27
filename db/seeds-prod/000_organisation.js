exports.seed = async knex => {
  const organisationFields = [
    {
      name: 'Etelä-Suomen aluetoimisto',
      leftId: 1,
      rightId: 2,
    },
    {
      name: 'Pohjois-Suomen aluetoimisto',
      leftId: 3,
      rightId: 4,
    },
    {
      name: 'Länsi-Suomen aluetoimisto',
      leftId: 5,
      rightId: 6,
    },
    {
      name: 'Keski-Suomen aluetoimisto',
      leftId: 7,
      rightId: 8,
    },
    {
      name: 'Itä-Suomen aluetoimisto',
      leftId: 9,
      rightId: 10,
    },
  ];

  return knex.batchInsert('organisation', organisationFields, 1);
};
