
import Boom from 'boom';

export function handleApiError(reply) {
  return error => {
    if (error && error.isBoom) {
      reply(error);
    } else {
      console.log(error, error.stack);
      reply(Boom.badImplementation(error));
    }
  };
}
