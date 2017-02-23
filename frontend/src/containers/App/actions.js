import {
  DRAWER_TOGGLE,
  DRAWER_CHANGE,
  CHANGE_ACTIVE_SUBTREE,
  SAVE_TREE,
  DATA_RECIEVED
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

export function saveTree(dataTree) {
  return {
    type: SAVE_TREE,
    dataTree,
  };
}

export function changeActiveSubtree(subtreeRootId) {
  return {
    type: CHANGE_ACTIVE_SUBTREE,
    subtreeRootId,
  };
}

export function dataRecieved(newMeasurementData) {
  return {
    type: DATA_RECIEVED,
    newMeasurementData: newMeasurementData
  }
}
