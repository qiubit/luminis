import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';


function Chart(props) {
  return (
    <LineChart width={800} height={400} data={props.chart}>
      <Line type="monotone" dataKey="y" isAnimationActive={false} />
      <CartesianGrid />
      <XAxis orientation={"top"} dataKey={"x"} interval={3}/>
      <YAxis />
    </LineChart>
  );
}

export default Chart;
