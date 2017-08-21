import Boom from 'boom';

import { createToken } from '../utils/auth';
import {
  dbGetChildren,
  dbGetChild,
  dbDelChild,
  dbCreateChild,
  dbUpdateChild,
} from '../models/children';

import { countAndPaginate, countAndPaginateRaw } from '../utils/db';

export const getChildren = (request, reply) =>
  countAndPaginateRaw(
    dbGetChildren(request.query, request.pre.employee.id, request.pre.employee.scope),
    request.query.limit,
    request.query.offset,
  ).then(reply);
  

export const getChild = (request, reply) =>
  dbGetChild(request.params.childId).then(reply);

export const delChild = (request, reply) =>
  dbDelChild(request.params.childId).then(reply);

export const registerChild = (request, reply) =>
  dbCreateChild(request.payload)
    .then(child =>
      reply({
        ...child,
        ...createToken({
          id: child.id,
          scope: 'child',
        }),
      }),
    )
    .catch(err => reply(Boom.badImplementation(err)));

export const updateChild = (request, reply) =>
  dbUpdateChild(request.params.childId, request.payload).then(reply);
