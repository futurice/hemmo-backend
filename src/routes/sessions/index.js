import knex from 'db';
import Boom from 'boom';
import Joi from 'joi';
import _ from 'lodash';
import uuid from 'node-uuid';

import { bindEmployeeData, bindUserData } from '../../utils/authUtil';
import sessions from '../../services/sessions';

const create = {
  // TODO: auth strategy? don't do authentication in bindUserData!
  pre: [
    {method: bindUserData, assign: 'user'}
  ],
  handler: function(request, reply) {
    const sessionId = uuid.v4();
    const assigneeId = request.pre.user.assigneeId;

    knex('sessions').insert({
      userId: request.pre.user.id,
      createdAt: knex.fn.now(),
      sessionId: sessionId,
      assigneeId: assigneeId
    })
    .then(function() {
      return reply({
        sessionId: sessionId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest('Could not create session'));
    });
  }
};

const update = {
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
    const reviewed = _.get(request, 'payload.reviewed', null);
    const assigneeId = _.get(request, 'payload.assigneeId', null);

    const updateDict = {
      reviewed: reviewed,
      assigneeId: assigneeId,
      updatedAt: knex.fn.now()
    };

    // Strip undefined values
    const strippedDict = _.omitBy(updateDict, _.isUndefined);

    const empty = _.isEmpty(strippedDict);
    if (empty) {
      return reply('Success');
    }

    knex('sessions').where('sessionId', sessionId)
    .returning('*')
    .update(strippedDict)
    .then((results) => {
      const session = results[0];

      return reply({
        id: session.sessionId,
        reviewed: session.reviewed,
        assigneeId: session.assigneeId
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to update session'));
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
      sessionId: Joi.string().length(36).required()
    }
  },
  handler: function(request, reply) {
    const sessionId = request.params.sessionId;

    knex('sessions').where('sessionId', sessionId).del()
    .then(results => {
      return reply({ deletedSessions: results });
    })
    .catch(err => {
      console.log(err);
      return reply(Boom.badRequest('Failed to delete session'));
    });
  }
};

const list = {
  auth: {
    strategy: 'jwt',
    scope: 'employee'
  },
  handler: function(request, reply) {
    const assigneeId = _.get(request, 'query.assignee', null);
    const reviewed = _.get(request, 'query.reviewed', null);
    const userId = _.get(request, 'query.user', null);
    const limit = _.get(request, 'query.limit', 20);
    const order = _.get(request, 'query.order', 'desc');
    const offset = _.get(request, 'query.offset', 0);

    const filters = {
      'sessions.reviewed': reviewed,
      'sessions.userId': userId,
      'sessions.assigneeId': assigneeId
    };

    // Strip null values
    const strippedFilters = _.omitBy(filters, _.isNil);

    sessions.list(strippedFilters, limit, offset, order)
      .then(function(sessionsArray) {
        return reply({
          count: sessionsArray.length,
          sessions: sessionsArray
        });
      })
      .catch((err) => {
        console.log(err);
        return reply(Boom.badRequest('Failed to get session data'));
      });
  }
};

const get = {
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
    }).first('*')
      .bind({}) // http://bluebirdjs.com/docs/api/promise.bind.html
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
          questions: content.questions,
          moods: content.moods,
          createdAt: content.createdAt
        };
      });
      this.content = contentArray;
      return knex.first('name', 'id', 'assigneeId').from('users').where('id' ,this.session.userId);
    })
    .then(function(user) {
      if (!user) {
        throw new Error('No user was found for the session');
      }
      return reply({
        id: this.session.sessionId,
        assigneeId: this.session.assigneeId,
        user: {
          name: user.name,
          id: user.id,
          assigneeId: user.assigneeId
        },
        reviewed: this.session.reviewed,
        createdAt: this.session.createdAt,
        content: this.content
      });
    })
    .catch((err) => {
      return reply(Boom.badRequest('Failed to get sessions data'));
    });
  }
};

export default [
  {
    method: 'POST',
    path: '/session', // TODO: these are different
    config: create
  }, {
    method: 'PUT',
    path: '/sessions/{sessionId}', // TODO: these are different
    config: update
  }, {
    method: 'DELETE',
    path: '/sessions/{sessionId}',
    config: del
  }, {
    method: 'GET',
    path: '/sessions',
    config: list
  }, {
    method: 'GET',
    path: '/sessions/{sessionId}',
    config: get
  }
];
