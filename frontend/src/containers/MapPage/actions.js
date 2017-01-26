import {
  CHANGE_ACTIVE_SUBTREE,
} from './constants';

export function changeActiveSubtree(subtreeId) {
  return {
    type: CHANGE_ACTIVE_SUBTREE,
    subtreeId,
  };
}
