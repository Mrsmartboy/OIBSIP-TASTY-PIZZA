import React, { useEffect, useState,useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from "../Header";
import PizzaList from "../PizzaList";
import Footer from '../Footer/Footer';
import './index.css';
import { toast } from 'react-toastify';

const Home = ({ dispatch }) => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPizzas = useCallback( async() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://oibsip-tasty-pizza.onrender.com/api/pizzaData`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPizzas(response.data.pizzas);
    } catch (error) {
      console.error('Error fetching pizzas:', error);
    } finally {
      setLoading(false);
    }
   
  },[]);

  useEffect(() => {
    fetchPizzas();
  }, [fetchPizzas]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const navigateToCategory = (category) => {
    navigate(`/menu/category/${category}`);
    toast.success(`Filter ${category} category`,{autoClose:2000})
  };

  return (
    <>
      <Header dispatch={dispatch} />
    <div className="home-container">
      <div className="header-component">
      
      </div>
      <div className="all-container">
        <div className="banner-container">
          <img src='/pizza-banner.png' alt="pizza-banner" className="pizza-banner" />
        </div>
        <div className="card-main-container">
          <h1 className="category-title">Choose which category you want</h1>
          <div className="card-container">
            <div className="card">
              <img src="/veg-pizza-card-1.jpg" alt="veg-pizza" className="card-image" />
              <p className="card-description">A Veggie Pizza is a flavorful delight with fresh vegetables, rich tomato sauce, and melted cheese on a crispy crust. Perfect for a tasty and healthy meal!</p>
              <button className="card-button" onClick={() => navigateToCategory('veg')}>Veggie Pizza</button>
            </div>
            <div className="card">
              <img src="/nonveg-pizza.jpeg" alt="non-veg-pizza" className="card-image" />
              <p className="card-description">A non-veg pizza is a savory delight topped with a medley of meats like pepperoni, sausage, and chicken. It combines rich flavors and hearty textures, perfect for meat lovers</p>
              <button className="card-button" onClick={() => navigateToCategory('non_veg')}>Non-Veg Pizza</button>
            </div>
            <div className="card">
              <img src="/mixed-pizza.jpeg" alt="mixed-pizza" className="card-image" />
              <p className="card-description">A mixed pizza combines the best of both worlds with a variety of fresh vegetables and savory meats. It's a delightful fusion of flavors that caters to all tastes.</p>
              <button className="card-button" onClick={() => navigateToCategory('mix')}>Mixed Pizza</button>
            </div>
          </div>
        </div>
        <div>
          <h1 className="look-menu">Look at Our Menu</h1>
          <div className="pizza-menu-container">
            <img src="/pizza-menu.png" alt="pizza-menu" className="pizza-menu-image" />
            <div className="pizza-menu-data-container">
              <h1 className="pizza-menu-head">Pizza Menu</h1>
              <h1 className="pizza-menu-quotes">Making life tastier, one pizza at a time</h1>
              <p className="pizza-menu-description">At Tasty Pizza, we craft each pizza with love and the finest ingredients, bringing joy to every bite. Our mission is to unite people through the irresistible flavors of our delicious, handcrafted pizzas.</p>
              <button className="button-menu" onClick={() => navigateToCategory('all')}>Choose Menu</button>
            </div>
          </div>
        </div>
        <div>
          <h1 className='hurry-up'>Hurry Up! Order Now</h1>
          {pizzas.length === 0 ? (
            <p className='no-pizza'>No pizzas found</p>
          ) : (
            <ul className="pizza-list-main-container">
              {pizzas.map((pizza, index) => (
                <PizzaList key={`${pizza._id}-${index}`} pizza={pizza} />
              ))}
            </ul>
          )}
          <button className='showmore-button' onClick={() => navigateToCategory('all')}>Show more...</button>
        </div>
      </div>
     
    </div>
     <Footer/> 
     </>
  )
}

export default Home;
