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
