import React from 'react';
import './Barchart.css'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data }) => {
  const chartData = {
  labels: data.map((item) => item.priceRange), 
  datasets: [
    {
      label: 'Number of Items',
      data: data.map((item) => item.itemCount),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    },
  ],
};


  return (
    <div className="bar-chart">
      <h2>Transactions Bar Chart</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default BarChart;
