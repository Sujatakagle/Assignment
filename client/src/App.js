import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TransactionsTable from './TransactionsTable';
import Statistics from './Statistics';
import BarChart from './BarChart';
import './App.css'

const App = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('3'); // Default to March
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({});
  const [barChartData, setBarChartData] = useState([]);

  const fetchTransactions = useCallback(async () => {
    try {
      console.log('Fetching transactions for page:', currentPage);
      const response = await axios.get(`http://localhost:4000/transactions`, {
        params: { month, search: searchTerm, page: currentPage }
      });
      console.log('Transactions response:', response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [month, searchTerm, currentPage]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/statistics`, { params: { month } });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, [month]);

  const fetchBarChartData = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/bar-chart`, { params: { month } });
      setBarChartData(response.data);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  }, [month]);

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
  }, [fetchTransactions, fetchStatistics, fetchBarChartData]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="App">
      <h1>Transactions Dashboard</h1>
      <select value={month} onChange={(e) => setMonth(e.target.value)}>
        <option value="1">January</option>
        <option value="2">February</option>
        <option value="3">March</option>
        <option value="4">April</option>
        <option value="5">May</option>
        <option value="6">June</option>
        <option value="7">July</option>
        <option value="8">August</option>
        <option value="9">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>
      <input
        type="text"
        placeholder="Search transactions"
        value={searchTerm}
        onChange={handleSearch}
      />
      <button onClick={handlePrevPage}>Previous</button>
      <button onClick={handleNextPage}>Next</button>
      <TransactionsTable transactions={transactions} />
      <Statistics stats={stats} />
      <BarChart data={barChartData} />
    </div>
  );
};

export default App;
