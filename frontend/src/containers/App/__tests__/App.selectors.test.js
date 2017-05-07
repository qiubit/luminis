import { fromJS, List } from 'immutable'
import {
  selectDrawerOpen,
  selectNodesMetadata,
  selectNodeMetadata,
  selectNodeName,
  selectNodeMeasurements,
  selectNodePosition,
  selectNodePositionX,
  selectNodePositionY,
  selectTreeStructure,
  selectTreeTimestamp,
  selectMeasurementsMetadata,
  selectMeasurementMetadata,
  selectMeasurementName,
  selectActiveNodeId,
  createSelectSubtree,
  selectActiveSubtree,
  getTreeIdList,
} from '../selectors'
import reducer from '../reducer'

describe('App selectors', () => {
  // Sample state snapshot
  const state = fromJS({
    App: {
      drawerOpen: true,
      activeNodeId: 1,
      nodesMetadata: {
        1: {
          name: "asfaltowa",
          children: [2],
          parent: null,
          position: {
            x: "52.2059564",
            y: "21.00775838",
          },
          measurements: [3],
          node_id: 1,
        },
        2: {
          name: "asfaltowa 1",
          children: [],
          parent: 1,
          position: {
            x: "52.20727794",
            y: "21.00684643",
          },
          measurements: [1, 2],
          node_id: 2,
        }
      },
      treeStructure: [{
        children: [{
          children: [],
          node_id: 2,
        }],
        node_id: 1,
      }],
      treeTimestamp: 1494109719,
      measurementsMetadata: {
        1: {
          measurement_id: 1,
          refresh_time: null,
          name: "power",
          is_favourite: false,
          type: "real",
        },
        2: {
          measurement_id: 2,
          refresh_time: null,
          name: "brightness",
          is_favourite: true,
          type: "real",
        },
        3: {
          measurement_id: 3,
          refresh_time: null,
          name: "activity",
          is_favourite: true,
          type: "real",
        }
      }
    }
  })

  it('selectDrawerOpen works', () => {
    expect(selectDrawerOpen(state)).toEqual(true)
  })

  it('selectNodesMetadata works', () => {
    expect(selectNodesMetadata(state)).toEqual(state.get('App').get('nodesMetadata'))
  })

  it('selectNodeMetadata works', () => {
    expect(selectNodeMetadata(state)("2")).toEqual(state.get('App').get('nodesMetadata').get("2"))
  })

  it('selectNodeName works', () => {
    expect(selectNodeName(state)("2")).toEqual(state.get('App').get('nodesMetadata').get("2").get("name"))
  })

  it('selectNodeMeasurements works', () => {
    expect(selectNodeMeasurements(state)("2")).toEqual(state.get('App').get('nodesMetadata').get("2").get("measurements"))
  })

  it('selectNodePosition works', () => {
    expect(selectNodePosition(state)("2")).toEqual(state.get('App').get('nodesMetadata').get("2").get("position"))
  })

  it('selectNodePositionX works', () => {
    expect(selectNodePositionX(state)("2")).toEqual(state.get('App').get('nodesMetadata').get("2").get("position").get("x"))
  })

  it('selectNodePositionY works', () => {
    expect(selectNodePositionY(state)("2")).toEqual(state.get('App').get('nodesMetadata').get("2").get("position").get("y"))
  })

  it('selectTreeStructure works', () => {
    expect(selectTreeStructure(state)).toEqual(state.get('App').get('treeStructure'))
  })

  it('selectTreeTimestamp works', () => {
    expect(selectTreeTimestamp(state)).toEqual(state.get('App').get('treeTimestamp'))
  })

  it('selectMeasurementsMetadata works', () => {
    expect(selectMeasurementsMetadata(state)).toEqual(state.get('App').get('measurementsMetadata'))
  })

  it('selectMeasurementMetadata works', () => {
    expect(selectMeasurementMetadata(state)("2")).toEqual(state.get('App').get('measurementsMetadata').get("2"))
  })

  it('selectMeasurementName works', () => {
    expect(selectMeasurementName(state)("2")).toEqual(state.get('App').get('measurementsMetadata').get("2").get("name"))
  })

  it('selectActiveNodeId works', () => {
    expect(selectActiveNodeId(state)).toEqual(state.get('App').get('activeNodeId'))
  })

  it('selectActiveSubtree works', () => {
    expect(selectActiveSubtree(state)).toEqual(state.get('App').get('treeStructure'))
  })

  it('getTreeIdList works', () => {
    expect(getTreeIdList(selectActiveSubtree(state))).toEqual(new List([1, 2]))
  })
})
