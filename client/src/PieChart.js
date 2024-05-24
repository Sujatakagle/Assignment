// src/PieChart.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PieChart({ month }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchPieChartData();
  }, [month]);

  const fetchPieChartData = async () => {
    try {
      const response = await axios.get(`/pie-chart?month=${month}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
    }
  };

  return (
    <div className="PieChart">
      <h2>Pie Chart for {month}</h2>
      <div>
        {data.map((item) => (
          <div key={item.category}>
            <p>{item.category}: {item.itemCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PieChart;
