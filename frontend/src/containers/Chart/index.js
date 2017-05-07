/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import { connect } from 'react-redux';

import Chart from '../../components/Chart/index';
import { selectRequestedData } from '../App/selectors'
import { selectActiveRequestId } from '../ChartManager/selectors'

const mapStateToProps = (state, ownProps) => {
  let activeRequestId = selectActiveRequestId(state);
  let requestedData = selectRequestedData(state);
  let chart = []
  if (activeRequestId && requestedData.has(activeRequestId)) {
    chart = requestedData.get(activeRequestId).get('data').get('plot_data').toJS();
  }
  return {
    chart
  }
}

export default connect(mapStateToProps)(Chart);
