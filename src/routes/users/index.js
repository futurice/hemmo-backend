import knex from 'db';
import Boom from 'boom';
import Joi from 'joi';
import _ from 'lodash';

import { bindEmployeeData, bindUserData } from '../../utils/authUtil';

const create = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  validate: {
    payload: {
      name: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    const name = request.payload['name'];
    knex('users').insert({
      name: name
    })
    .returning('id')
    .then(function(id) {
      const token = createToken(
        id,
        name,
        'user',
        null,
        true
      );

      // Reply with token
      return reply({ token });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};

const update = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  validate: {
    params: {
      userId: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    const userId = request.params.userId;
    const assigneeId = request.payload.assigneeId;
    knex('users').where('id', userId).update({assigneeId: assigneeId})
    .then(function() {
      return reply({
        assignee: {
          id: assigneeId
        }
      })
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to update user'));
    });
  }
};

const del = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      userId: Joi.number().required()
    }
  },
  handler: function(request, reply) {
    const userId = request.params.userId;

    knex('users').where('id', userId).del()
    .then(results => {
      return reply({ deletedUsers: results });
    })
    .catch(err => {
      console.log(err);
      return reply(Boom.badRequest('Failed to delete user'));
    });
  }
};

const list = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const offset = _.get(request, 'query.offset', 0);
    const limit = _.get(request, 'query.limit', 20);
    knex('users').select('users.name', 'employees.name as assignee', 'users.id', 'assigneeId', 'users.createdAt')
      .leftJoin('employees', 'users.assigneeId', 'employees.id')
      .limit(limit)
      .offset(offset)
      .orderBy('users.createdAt', 'desc')
      .bind({})
    .then(function(users) {
      this.users = _.map(users, user => ({
        name: user.name,
        assignee: user.assignee,
        id: user.id,
        createdAt: user.createdAt
      }));

      return knex('users').count('id');
    })
    .then(function(results) {
      return reply({
        count: parseInt(results[0].count),
        users: this.users
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to find users'));
    });
  }
};

const get = {
  validate: {
    params: {
      userId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const userId = request.params.userId;
    knex.first('name', 'assigneeId', 'createdAt').from('users').where('id', userId).bind({})
    .then(function(user) {
      if (!user) {
        throw new Error('User not found.');
      }
      this.user = user;
      return knex.select('createdAt', 'reviewed', 'sessionId').from('sessions').where('userId', userId);
    })
    .then(function(rows) {
      const sessions = _.map(rows, function(row) {
        return {
          createdAt: row.createdAt,
          reviewed: row.reviewed,
          id: row.sessionId
        };
      });
      this.sessions = sessions;
      return knex.first('id', 'name').from('employees').where('id', this.user.assigneeId);
    })
    .then(function(employee) {
      this.employee = employee || null;
      return knex('content').select('questions').innerJoin('sessions', 'content.sessionId', 'sessions.sessionId').where('sessions.userId', userId);
    })
    .then(function(contents) {
      let questions = _.flatten(contents.map(content => content.questions));

      const questionsWithLikes = _.filter(questions, question => !_.isNil(question.like));
      const likes = questionsWithLikes.map(question => question.like);
      const likeMean = _.mean(likes);

      return reply({
        name: this.user.name,
        createdAt: this.user.createdAt,
        sessions: this.sessions,
        assignee: this.employee,
        likes: likeMean
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to get user data'));
    });
  }
};

export default [
  {
    method: 'POST',
    path: '/register',
    config: create
  }, {
    method: 'PUT',
    path: '/users/{userId}',
    config: update
  }, {
    method: 'DELETE',
    path: '/users/{userId}',
    config: del
  }, {
    method: 'GET',
    path: '/users',
    config: list
  }, {
    method: 'GET',
    path: '/users/{userId}',
    config: get
  }
];
