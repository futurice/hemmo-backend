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

exports.newSessionConfig = {
  pre: [
    {method: bindUserData, assign: 'user'}
  ],
  handler: function(request, reply) {
    const sessionId = uuid.v4();
    knex('sessions').insert({
      userId: request.pre.user.id,
      startedAt: knex.fn.now(),
      sessionId: sessionId
    })
    .then(function() {
      return reply({
        sessionId: sessionId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};

exports.newContentConfig = {
  validate: {
    headers: Joi.object({
      session: Joi.string().length(36).required()
    }).options({allowUnknown: true}),
    payload: {
      contentType: Joi.string().required(),
      question: Joi.string().optional(),
      answer: Joi.string().optional()
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

      return knex('content').insert(_.merge(request.payload, {
        contentId: this.contentId,
        sessionId: this.sessionId,
        createdAt: knex.fn.now()
      }));
    })
    .then(function() {
      return reply({
        contentId: this.contentId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};

exports.updateContentConfig = {
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
    getUserSession(request.pre.user.id, request.headers.session).bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }

      this.contentId = request.params.contentId;
      this.sessionId = session.sessionId;

      const question = _.get(request, 'payload.question', null);
      const answer = _.get(request, 'payload.answer', null);
      const contentType = _.get(request, 'payload.contentType', null);

      const updateDict = {
        question: question,
        contentType: contentType,
        answer: answer,
        like: like
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
      return reply({
        contentId: this.contentId
      });
    })
    .catch(function(err) {
      console.log(err);
      return reply(Boom.badRequest(err));
    });
  }
};

exports.attachmentUploadConfig = {
  payload: {
    output: 'stream',
    maxBytes: sizeLimit
  },
  validate: {
    headers: Joi.object({
      session: Joi.string().length(36).required()
    }).options({allowUnknown: true}),
    params: {
      contentId: Joi.string().length(36).required()
    },
    payload: {
      file: Joi.any().required()
    }
  },
  pre: [
    {method: bindUserData, assign: 'user'}
  ],
  handler: function(request, reply) {
    const filename = request.payload.file.hapi.filename;
    let ext = '';

    if (filename && filename.lastIndexOf('.') !== -1) {
      ext = filename.substring(filename.lastIndexOf('.') + 1);
    }

    // Find user session by auth token and sessionId
    getUserSession(request.pre.user.id, request.headers.session).bind({})
    .then(function(session) {
      if (!session) {
        throw new Error('Session not found');
      }

      this.contentId = request.params.contentId;
      this.sessionId = request.headers.session;

      return mkdirp(uploadPath);
    })
    .then(function() {
      return new Promise((resolve, reject) => {
        this.filePath = path.join(uploadPath, this.contentId);
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
    .then(function() {
      return reply({
        contentId: this.contentId
      });
    })
    .catch(function(err) {
      return reply(Boom.badRequest(err));
    });
  }
};
