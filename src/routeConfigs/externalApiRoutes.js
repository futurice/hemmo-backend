import knex from '../db';
import Boom from 'boom';
import Joi from 'joi';
import _ from 'lodash';
import path from 'path';

import {
  bindEmployeeData
} from '../utils/authUtil';

const uploadPath = path.join(process.env.HOME, 'hemmo', 'uploads');

exports.getIndexConfig = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  handler: function(request, reply) {
    knex.select('name').from('users')
    .then(function(rows) {
      const data = _.map(rows, function(row) {
        return row.name;
      });
      return reply.view('index', {users: data});
    });
  }
};

exports.updateSessionData = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  pre: [
    {method: bindEmployeeData, assign: 'user'}
  ],
  validate: {
    params: {
      sessionId: Joi.string().length(36).required()
    }
  },
  handler: function(request, reply) {
    const sessionId = request.params.sessionId;
    const employeeId = _.get(request, 'payload.employeeId', null);
    const reviewed = _.get(request, 'payload.reviewed', null);

    const updateDict = {
      assigneeId: employeeId,
      reviewed: reviewed
    };
    // Strip null values
    const strippedDict = _.omitBy(updateDict, _.isNil);
    const empty = _.isEmpty(strippedDict);
    if (empty) {
      return reply('Success');
    }
    console.log(strippedDict);

    knex('sessions').where('sessionId', sessionId)
    .update(strippedDict)
    .then(function() {
      return reply('Success');
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest(err));
    });
    return 0;
  }
};

exports.getAttachmentConfig = {
  validate: {
    params: {
      contentId: Joi.string().length(36).required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    knex('content').where({
      contentId: request.params.contentId
    }).select('contentPath')
    .then((results) => {
      if (!results.length) {
        throw new Error('Attachment not found');
      }

      return reply.file(results[0].contentPath, {
        confine: uploadPath
      });
    })
    .catch((err) => {
      return reply(Boom.badRequest(err));
    });
  }
};

exports.getEmployeeDataConfig = {
  validate: {
    params: {
      employeeId: Joi.string().required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const employeeId = request.params.employeeId;
    knex.first('name', 'email').from('employees').where('id', employeeId)
    .then(function(employee) {
      if (!employee) {
        throw new Error('Employee not found.');
      }
      return reply({
        name: employee.name,
        email: employee.email
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};

exports.getUserDataConfig = {
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
    knex.first('name').from('users').where('id', userId).bind({})
    .then(function(user) {
      if (!user) {
        throw new Error('User not found.');
      }
      this.user = user;
      return knex.select('startedAt', 'reviewed').from('sessions').where('userId', userId);
    })
    .then(function(rows) {
      const sessions = _.map(rows, function(row) {
        return {
          startedAt: row.startedAt,
          reviewed: row.reviewed
        };
      });
      return reply({
        name: this.user.name,
        sessions: sessions
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};

exports.getSessionDataConfig = {
  validate: {
    params: {
      sessionId: Joi.string().length(36).required()
    }
  },
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    knex('sessions').where({
      sessionId: request.params.sessionId
    }).first('*').bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }

      this.session = session;

      return knex.select('*').from('content').where('sessionId', session.sessionId);
    })
    .then(function(contents) {
      const contentArray = _.map(contents, function(content) {
        return {
          contentId: content.contentId,
          question: content.question,
          contentType: content.contentType,
          createdAt: content.createdAt
        };
      });
      this.content = contentArray;
      return knex.first('name', 'id').from('users').where('id' ,this.session.userId);
    })
    .then(function(user) {
      if (!user) {
        throw new Error('No user was found for the session');
      }
      return reply({
        sessionId: this.session.sessionId,
        assigneeId: this.session.assigneeId,
        user: {
          name: user.name,
          userId: user.id
        },
        reviewed: this.session.reviewed,
        startedAt: this.session.startedAt,
        content: this.content
      });
    })
    .catch((err) => {
      return reply(Boom.badRequest(err));
    });
  }
};
