'use strict';

jest.mock('../src/db');
//jest.mock('knex');

import _ from 'lodash';
import initServer from '../src/server';
import fixtures, { renameKeys } from '../testutil/fixtures';
import request from '../testutil/request';

import mockKnex from 'mock-knex';
const tracker = mockKnex.getTracker();

describe('GET /employees', () => {
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

  it('should return list of all employees', () => {
    const employees = fixtures.generate('employee', 3);

    // Rename id => employeeId, pick employeeId, name, verified
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

    return request(server, {
      method: 'GET',
      url: '/employees',
      credentials: {
        scope: 'employee'
      }
    }).then((res) => {
      expect(res.result.employees).toEqual(resEmployees);
    });
  });
});
