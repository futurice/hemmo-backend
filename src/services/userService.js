import findById from '../utils/queryUtil';

export function findUserById(userId) {
  return findById('users', userId);
}
