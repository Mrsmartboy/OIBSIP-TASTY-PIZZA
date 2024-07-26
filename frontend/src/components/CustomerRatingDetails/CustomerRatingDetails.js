import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTable } from 'react-table';
import Cookies from 'js-cookie';
import AdminDashboard from '../AdminDashboard';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CustomerRatingDetails.css';

const CustomerRatingDetails = ({ dispatch }) => {
  const [ratingDetails, setRatingDetails] = useState([]);
  const [userData, setUserData] = useState([]);

  const fetchCustomerRatingData = useCallback(async () => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('https://oibsip-tasty-pizza.onrender.com/rating-details', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setRatingDetails(response.data);

      const userResponse = await axios.get('https://oibsip-tasty-pizza.onrender.com/api/admin/user-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setUserData(userResponse.data);

    } catch (error) {
      console.error('Error fetching admin rating details:', error);
      toast.error('Error fetching admin rating details. Please try again later.', { autoClose: 2000 });
    }
  }, []);

  useEffect(() => {
    fetchCustomerRatingData();
  }, [fetchCustomerRatingData]);

  const roundToDecimalPlaces = (num, decimals) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  };

  const data = useMemo(() => {
    return ratingDetails.map(rating => {
      const user = userData.find(user => user._id === rating._id);
      return {
        customerId: rating._id,
        customerName: user ? user.name : 'Unknown',
        avgRating: roundToDecimalPlaces(rating.avgRating, 2),
        totalAmountSpend: rating.totalAmountSpend,
      };
    });
  }, [ratingDetails, userData]);

  const columns = useMemo(() => [
    {
      Header: 'Customer ID',
      accessor: 'customerId',
    },
    {
      Header: 'Customer Name',
      accessor: 'customerName',
    },
    {
      Header: 'Average Rating',
      accessor: 'avgRating',
    },
    {
      Header: 'Total Amount Spend',
      accessor: 'totalAmountSpend',
    },
  ], []);

  const tableInstance = useTable({ columns, data });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div className="admin-dashboard-container-6">
      <AdminDashboard dispatch={dispatch} />
      <div className="table-container">
        <table {...getTableProps()} className="customer-table">
          <thead>
            {headerGroups.map((headerGroup, headerGroupIndex) => {
              const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={`headerGroup-${headerGroupIndex}`} {...restHeaderGroupProps}>
                  {headerGroup.headers.map((column) => {
                    const { key, ...restColumnProps } = column.getHeaderProps();
                    return (
                      <th key={column.id} {...restColumnProps}>
                        {column.render('Header')}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, rowIndex) => {
              prepareRow(row);
              const { key, ...restRowProps } = row.getRowProps();
              return (
                <tr key={`row-${rowIndex}`} {...restRowProps}>
                  {row.cells.map((cell) => {
                    const { key, ...restCellProps } = cell.getCellProps();
                    return (
                      <td key={cell.column.id} {...restCellProps}>
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerRatingDetails;
