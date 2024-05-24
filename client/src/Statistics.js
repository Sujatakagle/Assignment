import React from 'react';
import './statistics.css'
const Statistics = ({ stats }) => {
  return (
    <div className="statistics">
      <div>Total Sale Amount: {stats.totalSaleAmount}</div>
      <div>Total Sold Items: {stats.totalSoldItems}</div>
      <div>Total Not Sold Items: {stats.totalNotSoldItems}</div>
    </div>
  );
};

export default Statistics;
