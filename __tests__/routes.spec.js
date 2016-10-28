'use strict';

jest.mock('../src/db');

import _ from 'lodash';
import initServer from '../src/server';
import fixtures, { renameKeys } from '../testutil/fixtures';
import request from '../testutil/request';

import mockKnex from 'mock-knex';
const tracker = mockKnex.getTracker();

describe('GET /employees', () => {
  let options = {
    method: 'GET',
    url: '/employees',
    credentials: {
      scope: 'employee'
    }
  };

  let server = null;

  beforeAll(() => {
    return initServer()
      .then((_server) => {
        server = _server;
      });
  });

  beforeEach(() => {
    tracker.uninstall();
  });

  it('should require authentication', () => {
    return request(server, _.omit(options, 'credentials')).then((res) => {
      expect(res.statusCode).toBe(401);

      expect(res.result).toEqual({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Missing authentication'
      });
      expect(res.result.employees).toBeUndefined();
    });
  });

  it('should return list of all employees', () => {
    const employees = fixtures.generate('employee', 3);

    // Rename id => employeeId, pick employeeId, name, verified
    // No other keys allowed in result!
    const resEmployees = employees.map((employee) => (
      _.pick(renameKeys(employee, { id: 'employeeId' }), [
        'employeeId',
        'name',
        'verified'
      ])
    ));

    tracker.install();
    tracker.on('query', (query) => {
      query.response(employees);
    });

    return request(server, options).then((res) => {
      expect(res.statusCode).toEqual(200);
      expect(res.result.employees).toEqual(resEmployees);
    });
  });

  it('should fail gracefully on db errors', () => {
    tracker.install();
    tracker.on('query', (query) => {
      query.reject('Dummy error');
    });

    return request(server, options).then((res) => {
      expect(res.result).toEqual({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      });
    });
  });
});
