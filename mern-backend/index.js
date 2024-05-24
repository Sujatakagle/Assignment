const express = require('express');
const axios = require('axios');
const mysql = require('mysql');
const moment = require('moment');
const cors=require('cors')
const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transdb',
  port: '3308'
});

// Initialize database with data from third-party API
app.get('/initialize-database', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting connection from pool:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      let promises = data.map(item => {
        return new Promise((resolve, reject) => {
          // Convert dateOfSale to a proper format
          const formattedDateOfSale = moment(item.dateOfSale).format('YYYY-MM-DD HH:mm:ss');

          const query = 'INSERT INTO transact (title, description, price, image, dateOfSale, sold, category) VALUES (?, ?, ?, ?, ?, ?, ?)';
          const values = [item.title, item.description, item.price, item.image, formattedDateOfSale, item.sold, item.category];

          connection.query(query, values, (error, results) => {
            if (error) {
              console.error('Error inserting data:', error);
              return reject(error);
            }
            resolve(results);
          });
        });
      });

      Promise.all(promises)
        .then(() => {
          connection.release();
          res.status(200).json({ message: 'Database initialized successfully' });
        })
        .catch(error => {
          connection.release();
          console.error('Error inserting data:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        });
    });
  } catch (error) {
    console.error('Error fetching data from API:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// API endpoint to list all transactions with search and pagination
app.get('/transactions', (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  const offset = (page - 1) * perPage;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    let query = 'SELECT * FROM transact WHERE MONTH(dateOfSale) = ?';
    let queryParams = [month];

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR price LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' LIMIT ?, ?';
    queryParams.push(offset, parseInt(perPage));

    connection.query(query, queryParams, (error, results) => {
      connection.release();
      if (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      console.log('Fetched transactions:', results); // Log the fetched transactions
      res.status(200).json(results);
    });
  });
});


// API endpoint for statistics
app.get('/statistics', (req, res) => {
  const { month } = req.query;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const query = 'SELECT SUM(price) AS totalSaleAmount, COUNT(*) AS totalSoldItems, (SELECT COUNT(*) FROM transact WHERE MONTH(dateOfSale) = ? AND sold = 0) AS totalNotSoldItems FROM transact WHERE MONTH(dateOfSale) = ? AND sold = 1';
    connection.query(query, [month, month], (error, results) => {
      connection.release();
      if (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json(results[0]);
    });
  });
});

// API endpoint for bar chart data
// Backend Code (API Endpoint)
app.get('/bar-chart', (req, res) => {
  const { month } = req.query;
  
  // Assume `pool` is a properly initialized database connection pool

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const query = 'SELECT FLOOR(price/100)*100 AS priceRange, COUNT(*) AS itemCount FROM transact WHERE MONTH(dateOfSale) = ? GROUP BY priceRange ORDER BY priceRange';
    
    // Use parameterized query to prevent SQL injection
    connection.query(query, [month], (error, results) => {
      connection.release(); // Release connection back to the pool
      
      if (error) {
        console.error('Error fetching bar chart data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      
      // Send the query results as JSON response
      res.status(200).json(results);
    });
  });
});

// API endpoint for pie chart data
app.get('/pie-chart', (req, res) => {
  const { month } = req.query;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const query = 'SELECT category, COUNT(*) AS itemCount FROM transact WHERE MONTH(dateOfSale) = ? GROUP BY category';
    connection.query(query, [month], (error, results) => {
      connection.release();
      if (error) {
        console.error('Error fetching pie chart data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json(results);
    });
  });
});

// API endpoint to combine data from all APIs
app.get('/combined-data', async (req, res) => {
  try {
    const month = req.query.month;

    // Send requests to all APIs in parallel
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:4000/transactions?month=${month}`),
      axios.get(`http://localhost:4000/statistics?month=${month}`),
      axios.get(`http://localhost:4000/bar-chart?month=${month}`),
      axios.get(`http://localhost:4000/pie-chart?month=${month}`)
    ]);

    // Combine responses
    const combinedData = {
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error combining data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
