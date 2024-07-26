import React, { useEffect, useState ,useCallback} from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import axios from 'axios'; 
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';
import './pizzaDetails.css';
import Footer from '../Footer/Footer';
import { toast } from 'react-toastify';

const PizzaDetails = ({ dispatch }) => {
  const { pizzaId } = useParams(); // Get pizzaId from URL params
  const [pizza, setPizza] = useState(null); // State to hold pizza details
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [data, setData] = useState(null);
  const [dataDetails, setDataDetails] = useState({
    pizzaBase: { id: null, name: null },
    pizzaCheese: { id: null, name: null },
    pizzaSauce: { id: null, name: null },
    pizzaVeg: { id: null, name: null }
  });


  const { addToCart } = useCart();
  const navigate = useNavigate();
  let eachUnitPrice;

  if (pizza) {
    eachUnitPrice = Math.floor(pizza.price - pizza.price * pizza.discountPrice / 100);
  }

  const fetchPizzaExtraDetails = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`https://oibsip-tasty-pizza.onrender.com/api/pizzaExtra`, {
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });
      if (response) {
        setLoading(false);
        setData(response.data);
      }
    } catch (error) {
      console.error('Error fetching pizza extras:', error);
    } finally {
      setLoading(false);
    }
  },[]);


  useEffect(() => {
    const fetchPizzaDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`https://oibsip-tasty-pizza.onrender.com/api/pizzaDetails/${pizzaId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response) {
          setLoading(false);
          setPizza(response.data);
          
        }
      } catch (error) {
        console.error('Error fetching pizza details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzaDetails();
    fetchPizzaExtraDetails();
  }, [pizzaId,fetchPizzaExtraDetails]); // Fetch details whenever pizzaId changes




  const handleQuantitySelect = (e) => {
    setQuantity(e.target.value);
  };

  const handleRadioButton = (event) => {
    const { name, id, value } = event.target;
    setDataDetails({ ...dataDetails, [name]: { id: parseInt(id), name: value } });
  }; 


  const handleAddToCart = () => {
 
    if (dataDetails.pizzaBase.id && dataDetails.pizzaCheese.id && dataDetails.pizzaSauce.id && dataDetails.pizzaVeg.id) {
      addToCart(dataDetails, quantity, pizza, eachUnitPrice * quantity, eachUnitPrice);
      navigate('/cart');
    } else {
      toast.error("Please Select veggies", { autoClose: 2000 });
    }
  };

  return (
    <>
      <div className="header-component-pizza-details">
        <Header dispatch={dispatch} />
      </div>
      {loading ? (
        <p>Loading...</p> 
      ) : (
        pizza && (
          <div className='pizza-details-container'>
            <div className='details-image-container'>
              <img src={pizza.imageUrl || '/Caprese id33.jpeg'} alt={pizza.name} className='details-image' />
              <button className='details-cart-button' onClick={handleAddToCart}>Add to cart</button>
            </div>
            <div className='details-data-container'>
              <h1 className='details-name'>{pizza.name}</h1>
              <p className='details-price'>Rs.{eachUnitPrice * quantity}</p>
              <p className='details-description'>{pizza.pizzaDetails}</p>
              <div className="cart-item-quantity-container">
                <label htmlFor={`quantity-${pizza.pizzaId}`} className="cart-item-quantity-label">
                  Quantity:
                </label>
                <select
                  id={`quantity-${pizza.pizzaId}`}
                  className="cart-item-quantity-select"
                  value={quantity}
                  onChange={handleQuantitySelect}
                >
                  {[1, 2, 3, 4].map((qty) => (
                    <option key={qty} value={qty} className='option'>
                      {qty}
                    </option>
                  ))}
                </select>
              </div>
              {data && data.orderDetails && (
                <div className='data-details-container'>
                  {data.orderDetails.Pizza_Base && (
                    <fieldset>
                      <legend>Pizza Base</legend>
                      {data.orderDetails.Pizza_Base.map(eachItem => (
                        <label key={eachItem.id} className='details-label' onChange={handleRadioButton}>
                          <input type="radio" name="pizzaBase" value={eachItem.name} id={eachItem.id} />
                          {eachItem.name}
                        </label>
                      ))}
                    </fieldset>
                  )}
                  {data.orderDetails.Pizza_Cheese && (
                    <fieldset>
                      <legend>Pizza Cheese</legend>
                      {data.orderDetails.Pizza_Cheese.map(eachItem => (
                        <label key={eachItem.id} className='details-label' onChange={handleRadioButton}>
                          <input type="radio" name="pizzaCheese" value={eachItem.name} id={eachItem.id} />
                          {eachItem.name}
                        </label>
                      ))}
                    </fieldset>
                  )}
                  {data.orderDetails.Pizza_Sauce && (
                    <fieldset>
                      <legend>Pizza Sauce</legend>
                      {data.orderDetails.Pizza_Sauce.map(eachItem => (
                        <label key={eachItem.id} className='details-label' onChange={handleRadioButton}>
                          <input type="radio" name="pizzaSauce" value={eachItem.name} id={eachItem.id} />
                          {eachItem.name}
                        </label>
                      ))}
                    </fieldset>
                  )}
                  {data.orderDetails.Pizza_Veg && (
                    <fieldset>
                      <legend>Pizza Veg</legend>
                      {data.orderDetails.Pizza_Veg.map(eachItem => (
                        <label key={eachItem.id} className='details-label' onChange={handleRadioButton}>
                          <input type="radio" name="pizzaVeg" value={eachItem.name} id={eachItem.id} className='radio-button' />
                          {eachItem.name}
                        </label>
                      ))}
                    </fieldset>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      )}
      <Footer/>
    </> 
  );
};

export default PizzaDetails;
