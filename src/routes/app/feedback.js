import { getAuthWithScope } from '../../utils/auth';
import { createFeedback } from '../../handlers/feedback';

const routeConfigs = [
  // Create new feedback session
  {
    method: 'POST',
    path: '/app/feedback',
    handler: createFeedback,
    config: getAuthWithScope('child'),
  },
];

export default routeConfigs;

// Here we register the routes
export const routes = server => server.route(routeConfigs);
