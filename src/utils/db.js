import init from 'knex';
// import pg from 'pg';

import config from './config';

// Use ssl by default
// pg.defaults.ssl = true;

const knex = init(config.db);
export default knex;

/**
 * Builds SQL query with given filter object.
 * Returns rows matching all given fields (default), or any given field.
 *
 * Sample usage:
 *
 * knex('employees')
 *   .where(likeFilter({
 *     name: 'foo',
 *     email: '@bar.com'
 *   }))
 */
export const likeFilter = (filters, anyField = false) => origQuery => {
  let q = origQuery;

  if (!filters) {
    return q;
  }

  Object.keys(filters).filter(key => filters[key]).forEach((key, index) => {
    if (!index) {
      // first field with .whereRaw()
      q = q.whereRaw("LOWER(??) LIKE '%' || LOWER(?) || '%'", [
        key,
        filters[key],
      ]);
    } else if (anyField) {
      // if anyField true, additional fields use .orWhereRaw() (any field must match)
      q = q.orWhereRaw("LOWER(??) LIKE '%' || LOWER(?) || '%'", [
        key,
        filters[key],
      ]);
    } else {
      // by default additional fields use .andWhereRaw() (all fields must match)
      q = q.andWhereRaw("LOWER(??) LIKE '%' || LOWER(?) || '%'", [
        key,
        filters[key],
      ]);
    }
  });

  return q;
};

export const exactFilter = (filters, anyField = false) => origQuery => {
  let q = origQuery;

  if (!filters) {
    return q;
  }

  Object.keys(filters).filter(key => filters[key]).forEach((key, index) => {
    if (!index) {
      // first field with .whereRaw()
      q = q.where({ [key]: filters[key] });
    } else if (anyField) {
      q = q.orWhere({ [key]: filters[key] });
    } else {
      q = q.andWhere({ [key]: filters[key] });
    }
  });

  return q;
};

/**
 * Returns query results as JSON containing total row count before
 * applying limit/offset
 *
 * Sample results:
 * {
 *   data: [
 *     <Query results>
 *   ],
 *   meta: {
 *     count: 100,
 *     limit: 5,
 *     offset: 5,
 *   }
 * }
 */
export const countAndPaginate = (
  q,
  limit = config.defaults.limit,
  offset = 0,
) => knex
    .select([
      knex.raw('json_agg(limited."queryResults") as data'),
      'limited.cnt',
    ])
    .from(limitQuery =>
      limitQuery
        /* Subquery: Limit & offset the query results */
        .select([
          'queryResults',
          knex.raw('count("queryResults") over() as cnt'),
        ])
        .from(q.as('queryResults'))
        .offset(offset)
        .limit(limit)
        .as('limited'),
    )
    .groupBy('limited.cnt')
    .then(results => results[0] || {
        data: [],
        cnt: 0,
      }
    )
    .then(result => ({
      data: result.data,
      meta: {
        count: Number(result.cnt),
        limit: Number(limit),
        offset: Number(offset),
      },
    }));
