import AdminDashboard from "../AdminDashboard";
import { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './PizzaUpdate.css';

const PizzaUpdate = ({ dispatch }) => {
  const [pizzadata, setPizzaData] = useState([]);
  const [editPizzaId, setEditPizzaId] = useState(null);
  const [editPizzaQuantity, setEditPizzaQuantity] = useState('');

  const handleEditClick = (pizza) => {
    setEditPizzaId(pizza._id);
    setEditPizzaQuantity(pizza.quantity);
  };

  const fetchPizzaDetails = useCallback(async () => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get('http://localhost:10000/api/admin/pizza-details', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPizzaData(response.data);
    } catch (error) {
      console.error('Error fetching pizza details:', error);
      toast.error('Error fetching pizza details. Please try again later.', { autoClose: 2000 });
    }
    fetchPizzaDetails()
  }, []);

  const handleUpdateClick = useCallback(async (pizzaId) => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response =await axios.put(
        `http://localhost:10000/api/admin/pizza-update/${pizzaId}`,
        { quantity: parseInt(editPizzaQuantity) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      if (response.data.success){
        toast.success('Order updated successfully',{autoClose:2000});
        setEditPizzaId(null);
        fetchPizzaDetails(); // Refresh pizza data after update
      }
    
    } catch (error) {
      console.error('Error updating pizza:', error);
      toast.error('Error updating pizza. Please try again later.', { autoClose: 2000 });
    }
  },[editPizzaQuantity,fetchPizzaDetails]);

  const handleDeleteClick = useCallback(async (pizzaId) => {
    try {
      const token = Cookies.get('adminToken');
  
      if (!token) {
        console.error('No token found');
        return;
      }
  
      // Fetch the pizza details before deleting
      const pizzaResponse = await axios.get(`http://localhost:10000/api/admin/pizza-details/${pizzaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      const pizzaData = pizzaResponse.data;
      // Post the pizza details to the deleted-pizzas endpoint
      await axios.post(`http://localhost:10000/api/admin/deleted-pizzas`, {pizzaData}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      // Delete the pizza
      await axios.delete(`http://localhost:10000/api/admin/pizza-delete/${pizzaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      toast.success('Pizza deleted successfully',{autoClose:2000});
      fetchPizzaDetails(); // Refresh pizza data after deletion
    } catch (error) {
      console.error('Error deleting pizza:', error);
      toast.error('Error deleting pizza. Please try again later.', { autoClose: 2000 });
    }
  },[fetchPizzaDetails]);
  



  useEffect(() => {
    fetchPizzaDetails();
  }, [fetchPizzaDetails]);

  return (
    <div className="admin-dashboard-container-1">
      <AdminDashboard dispatch={dispatch} />
      <div className="table-container">
        {pizzadata.length > 0 ? (
          <table className="pizza-table">
            <thead>
              <tr>
                <th>Pizza ID</th>
                <th>Pizza Name</th>
                <th>Quantity</th>
                <th>Quantity Update(+)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pizzadata.map((pizza) => (
                <tr key={pizza._id}>
                  <td>{pizza._id}</td>
                  <td>{pizza.name}</td>
                  <td>{pizza.quantity}</td>
                  <td>
                    {editPizzaId === pizza._id ? (
                      <select
                        value={editPizzaQuantity}
                        onChange={(e) => setEditPizzaQuantity(e.target.value)}
                        className="quantity-dropdown"
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{pizza.quantity}</span>
                    )}
                  </td>
                  <td>
                    {editPizzaId === pizza._id ? (
                      <button
                        className="update-button"
                        onClick={() => handleUpdateClick(pizza._id)}
                      >
                        Update
                      </button>
                    ) : (
                      <button className="edit-button" onClick={() => handleEditClick(pizza)}>
                        Edit
                      </button>
                    )}
                    <button className="delete-button" onClick={() => handleDeleteClick(pizza._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No Update Available.</p>
        )}
      </div>
    </div>
  );
};

export default PizzaUpdate;
