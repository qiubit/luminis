import {
  SHOW_MAP_TREE,
} from './constants';

export function showMapTree(tree) {
  return {
    type: SHOW_MAP_TREE,
    tree,
  };
}
