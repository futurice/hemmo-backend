import findOneBy from '../utils/queryUtil';

export function findCounterByUserId(userId) {
  return findOneBy('counter', {'user_id': userId});
}
