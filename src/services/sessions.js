import knex from 'db';

const list = (strippedFilters, limit, offset, order) => {
  const sessionsArray = [];
  return knex.select(
    'sessionId',
    'userId',
    'reviewed',
    'sessions.createdAt',
    'employees.name as assignee',
    'users.name as userName',
    'sessions.updatedAt')

    .from('sessions').where(strippedFilters)
    .leftJoin('employees', 'sessions.assigneeId', 'employees.id')
    .leftJoin('users', 'sessions.userId', 'users.id')
    .orderBy('sessions.createdAt', order)
    .limit(limit)
    .offset(offset)
    .bind({})
    .each(function(session) {
      const sessDict = {
        id: session.sessionId,
        assignee: session.assignee,
        user: {
          name: session.userName,
          id: session.userId
        },
        reviewed: session.reviewed,
        createdAt: session.createdAt
      };

      sessionsArray.push(sessDict);
    })
    .then(() => sessionsArray);
};

export default { list };
