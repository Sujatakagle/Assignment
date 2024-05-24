import React from 'react';
import './TransactionsTable.css'

const TransactionsTable = ({ transactions }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Price</th>
          <th>Image</th>
          <th>Date of Sale</th>
          <th>Sold</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td>{transaction.title}</td>
            <td>{transaction.description}</td>
            <td>{transaction.price}</td>
            <td><img src={transaction.image} alt={transaction.title} width="50" /></td>
            <td>{transaction.dateOfSale}</td>
            <td>{transaction.sold ? 'Yes' : 'No'}</td>
            <td>{transaction.category}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionsTable;
