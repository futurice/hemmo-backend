import knex from '../db';
import Boom from 'boom';
import Joi from 'joi';
import Promise from 'bluebird';
import _ from 'lodash';
import uuid from 'node-uuid';
import fs from 'fs';
import path from 'path';

import {
  bindUserData
} from '../utils/authUtil';

const mkdirp = Promise.promisify(require('mkdirp'));

const uploadPath = path.join(process.env.HOME, 'hemmo', 'uploads');
const sizeLimit = 1024 * 1024 * 10; // 10 MB

const getUserSession = function(userId, sessionId) {
  return knex.first('sessionId').from('sessions').where({
    'userId': userId,
    'sessionId': sessionId
  });
};

const getUserContent = function(userId, sessionId, contentId) {
  return knex.first('contentId', 'content.sessionId').from('content').innerJoin('sessions', 'content.sessionId', 'sessions.sessionId')
  .where({
    'sessions.userId': userId,
    'sessions.sessionId': sessionId,
    'content.contentId': contentId
  });
}

exports.newSession = {
  pre: [
    {method: bindUserData, assign: 'user'}
  ],
  handler: function(request, reply) {
    const sessionId = uuid.v4();
    const assigneeId = request.pre.user.assigneeId;

    knex('sessions').insert({
      userId: request.pre.user.id,
      startedAt: knex.fn.now(),
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

exports.newContent = {
  validate: {
    headers: Joi.object({
      session: Joi.string().length(36).required()
    }).options({allowUnknown: true}),
    payload: {
      moods: Joi.array().items(Joi.string()).optional(),
      questions: Joi.array().items(Joi.object().keys({
        question: Joi.string(),
        like: Joi.number(),
        answer: Joi.string(),
        attachmentId: Joi.string()
      })).optional()
    }
  },
  pre: [
    {method: bindUserData, assign: 'user'}
  ],
  handler: function(request, reply) {
    // Check that the user actually owns the session requested
    getUserSession(request.pre.user.id, request.headers.session).bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }
      this.sessionId = session.sessionId;
      this.contentId = uuid.v4();

      return knex('content').insert({
        moods: JSON.stringify(request.payload.moods),
        questions: JSON.stringify(request.payload.questions),
        contentId: this.contentId,
        sessionId: this.sessionId,
        createdAt: knex.fn.now(),
      });
    })
    .then(function() {
      // Mark unreviewed
      return knex('sessions').where('sessionId', this.sessionId)
      .update({reviewed: false})
    })
    .then(function() {
      return reply({
        contentId: this.contentId
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to create new content'));
    });
  }
};

exports.updateContent = {
  validate: {
    headers: Joi.object({
      session: Joi.string().length(36).required()
    }).options({allowUnknown: true}),
    params: {
      contentId: Joi.string().length(36).required()
    }
  },
  pre: [
    {method: bindUserData, assign: 'user'}
  ],
  handler: function(request, reply) {
    // Find user session by auth token and sessionId
    getUserContent(request.pre.user.id, request.headers.session, request.params.contentId).bind({})
    .then(function(content) {
      if (!content) {
        throw new Error('Session not found');
      }
      this.contentId = content.contentId;
      this.sessionId = content.sessionId;

      const moods = _.get(request, 'payload.moods', null);
      const questions = _.get(request, 'payload.questions', null);

      const updateDict = {
        questions: JSON.stringify(questions),
        moods: JSON.stringify(moods)
      };
      // Strip null values
      const strippedDict = _.omitBy(updateDict, _.isNil);
      const empty = _.isEmpty(strippedDict);
      if (empty) {
        return reply({
          contentId: this.contentId
        });
      }

      return knex('content').where({
        'contentId': this.contentId,
        'sessionId': this.sessionId
      }).update(strippedDict);
    })
    .then(function() {
      // Mark unreviewed
      return knex('sessions').where('sessionId', this.sessionId)
      .update({reviewed: false})
    })
    .then(function() {
      return reply({
        contentId: this.contentId
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to update'));
    });
  }
};

exports.attachmentUpload = {
  payload: {
    output: 'stream',
    maxBytes: sizeLimit
  },
  validate: {
    headers: Joi.object({
      session: Joi.string().length(36).required()
    }).options({allowUnknown: true}),
    payload: {
      file: Joi.any().required()
    }
  },
  pre: [
    {method: bindUserData, assign: 'user'}
  ],
  handler: function(request, reply) {
    const attachmentId = uuid.v4();

    const filename = request.payload.file.hapi.filename;
    let ext = '';

    if (filename && filename.lastIndexOf('.') !== -1) {
      ext = filename.substring(filename.lastIndexOf('.') + 1);
    }

    getUserSession(request.pre.user.id, request.headers.session).bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }

      this.sessionId = request.headers.session;

      return mkdirp(uploadPath);
    })
    .then(function() {
      return new Promise((resolve, reject) => {
        this.filePath = path.join(uploadPath, attachmentId);
        if (ext) {
          this.filePath += '.' + ext;
        }

        const file = fs.createWriteStream(this.filePath);
        file.on('error', function(err) {
          reject(err);
        });

        const data = request.payload;
        if (!data.file) {
          throw new Error('Payload missing');
        }

        data.file.pipe(file);

        data.file.on('end', function(err) {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    })
    /*
    .then(function() {  // TODO: Remove old content if updating? or create new content?
      console.log("UPDATING....")
      return knex('content').where({
        contentId: this.contentId,
        sessionId: this.sessionId
      }).update({
        contentPath: this.filePath,
        hasAttachment: true
      });
    })
    */
    .then(function() {
      // Mark unreviewed
      return knex('sessions').where('sessionId', this.sessionId)
      .update({reviewed: false})
    })
    .then(function() {
      return reply({
        attachmentId
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest('Failed to upload attachment'));
    });
  }
};
