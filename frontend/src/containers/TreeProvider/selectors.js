import { createSelector } from 'reselect';
import { fromJS } from 'immutable';

import { selectDataTree } from '../App/selectors'



export const selectDataTreeIdList = createSelector (
    selectDataTree,
    (tree) => getTreeIdList(tree)
)
