/*
 * Copyright (C) 2017 Paweł Goliński
 * Copyright (C) 2017 Piotr Wiśniewski
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 */


import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts'


function Chart(props) {
  return (
    <LineChart width={800} height={400} data={props.chart}>
      <Line type="monotone" dataKey="y" isAnimationActive={false} />
      <CartesianGrid />
      <XAxis orientation={"top"} dataKey={"x"} interval={3}/>
      <YAxis />
    </LineChart>
  )
}

export default Chart
