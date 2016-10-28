/*eslint-disable object-curly-spacing*/

import {
  attachmentUpload,
  updateContent,
  newContent
} from './userEndpoints';

import {
  updateLocale,
  getAttachment
} from './employeeEndpoints';

import employeeEndpoints from './employees';
import sessionEndpoints from './sessions';
import userEndpoints from './users';

let routes = [];

// TODO: there are better ways with hapi's API?
routes = routes.concat(employeeEndpoints);
routes = routes.concat(sessionEndpoints);
routes = routes.concat(userEndpoints);

/*
-------------------------------------------------------
  Mobile user endpoints for the Hemmo mobile app.
*/

// TODO: Refactor rest of these

routes.push({
  method: 'POST',
  path: '/content',
  config: newContent
});

routes.push({
  method: 'PUT',
  path: '/content/{contentId}',
  config: updateContent
});

routes.push({
  method: 'PUT',
  path: '/attachment/{contentId}',
  config: attachmentUpload
});

/*
---------------------------------------------------------
  External api endpoints
  These require 'employee' scope in JWT (except registration
  and authentication of course)
*/

routes.push({
  method: 'GET',
  path: '/attachment/{attachmentId}',
  config: getAttachment
});

routes.push({
  method: 'POST',
  path: '/locale',
  config: updateLocale
});

export default routes;
