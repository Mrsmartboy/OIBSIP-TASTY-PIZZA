import AdminDashboard from '../AdminDashboard';
import { useEffect, useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Ensure this import is present
import './PizzaAnalysis.css';

const PizzaAnalysis = ({ dispatch }) => {
  const [historyData, setHistoryData] = useState(null);

  const fetchHistoryData = useCallback(async () => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/admin/history-data', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const historyData = response.data;
      setHistoryData(historyData);
    } catch (error) {
      console.error('Error fetching admin past order details:', error);
      toast.error('Error fetching admin past orders. Please try again later.', { autoClose: 2000 });
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Process data for charts
  const processDataForCharts = (data) => {
    const categoryCounts = {
      veg: 0,
      non_veg: 0,
      mix: 0,
    };

    data.forEach((order) => {
      order.cartItems.forEach((item) => {
        categoryCounts[item.category] += item.pizzaQuantity;
      });
    });

    return categoryCounts;
  };

  const categoryCounts = historyData ? processDataForCharts(historyData) : null;

  const pieData = {
    labels: ['Veg', 'Non-Veg', 'Mix'],
    datasets: [
      {
        data: categoryCounts ? [categoryCounts.veg, categoryCounts.non_veg, categoryCounts.mix] : [0, 0, 0],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  const barData = {
    labels: ['Veg', 'Non-Veg', 'Mix'],
    datasets: [
      {
        label: 'Number of Pizzas',
        data: categoryCounts ? [categoryCounts.veg, categoryCounts.non_veg, categoryCounts.mix] : [0, 0, 0],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  return (
    <div className="admin-dashboard-container-1">
      <AdminDashboard dispatch={dispatch} />
    <div className='main-title-container'>
        <h1 className='title-head'>Customer Preferred category</h1>
      <div className="charts-container">
        
        {categoryCounts ? (
          <>
            <div className="chart">
              <h3>Pizza Category Distribution (Pie Chart)</h3>
              <Pie data={pieData} />
            </div>
            <div className="chart">
              <h3>Pizza Category Distribution (Bar Graph)</h3>
              <Bar data={barData} />
            </div>
          </>
        ) : (
          <p>Loading data...</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default PizzaAnalysis;
