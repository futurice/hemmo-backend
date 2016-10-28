import Boom from 'boom';
import Joi from 'joi';
import _ from 'lodash';
import path from 'path';

import {
  bindEmployeeData
} from '../utils/authUtil';

const knex = require('db');

const uploadPath = path.join(process.env.HOME, 'hemmo', 'uploads');

exports.getIndex = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  handler: function(request, reply) {
    reply('Server is up and running');
  }
};

exports.updateLocale = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  validate: {
    query: {
      locale: Joi.string().required()
    }
  },
  handler: function(request, reply) {
    const { locale } = request.query;
    const { id } = request.auth.credentials;

    knex('employees')
    .where('id', id)
    .update({ locale })
    .then(function(result) {
      return reply({ locale });
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Failed to update locale'));
    });
  }
}

exports.updateUserData = {
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
}

exports.deleteUser = {
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

exports.getAttachment = {
  validate: {
    params: {
      attachmentId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    let attachmentPath = path.join(uploadPath, request.params.attachmentId);

    return reply.file(path.join(uploadPath, request.params.attachmentId), {
      confine: uploadPath
    });

    reply.file(attachmentPath);
  },
  state: {
    parse: true
  }
};



exports.getAllUsers = {
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

exports.getUserData = {
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
