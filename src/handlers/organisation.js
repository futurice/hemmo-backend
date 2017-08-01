import Boom from 'boom';

import {
  dbGetOrganisations,
  dbGetSingleOrganisation,
  dbDelOrganisation,
  dbUpdateOrganisation,
  dbCreateOrganisation,
} from '../models/organisation';

import { countAndPaginate } from '../utils/db';

export const getOrganisations = (request, reply) =>
  countAndPaginate(
    dbGetOrganisations(request.query),
    request.query.limit,
    request.query.offset,
  ).then(reply);

export const getSingleOrganisation = (request, reply) => 
  dbGetSingleOrganisation(request.params.organisationId).then(reply);

export const delOrganisation = (request, reply) =>
  dbDelOrganisation(request.params.organisationId).then(reply);

export const updateOrganisation = (request, reply) =>
  dbUpdateOrganisation(request.params.organisationId, request.payload).then(reply);

export const createOrganisation = (request, reply) =>
  dbCreateOrganisation(request.payload)
    .then(reply)
    .catch(err => reply(Boom.badImplementation(err)));
