import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
} from './constants';

export function drawerToggle() {
  return {
    type: DRAWER_TOGGLE,
  };
}

export function drawerChange(drawerOpen) {
  return {
    type: DRAWER_CHANGE,
    drawerOpen,
  };
}