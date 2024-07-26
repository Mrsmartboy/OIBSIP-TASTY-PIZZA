import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header';
import PizzaList from '../PizzaList';
import Footer from '../Footer/Footer';
import { toast } from 'react-toastify';
import './index.css';

const PizzaMenu = ({ dispatch }) => { 
  const [pizzas, setPizzas] = useState([]);
  const [filterPizza, setFilterPizza] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { category } = useParams();
  const navigate = useNavigate();

  const fetchPizzas = useCallback(async (page, category) => {
    const token = localStorage.getItem('token'); // Retrieve the token from local storage
    if (!token) {
      console.error('No token found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:10000/api/pizzaData?page=${page}&limit=20&category=${category}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPizzas(prevPizzas => (page === 1 ? response.data.pizzas : [...prevPizzas, ...response.data.pizzas]));
      setTotalPages(response.data.totalPages);
      setFilterPizza(prevPizzas => (page === 1 ? response.data.pizzas : [...prevPizzas, ...response.data.pizzas]));
    } catch (error) {
      console.error('Error fetching pizzas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPizzas(1, category);
  }, [category, fetchPizzas]);

  useEffect(() => {
    if (page > 1) {
      fetchPizzas(page, category);
    }
  }, [page, fetchPizzas, category]);

  const onShowMore = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleCategoryClick = (selectedCategory) => {
    navigate(`/menu/category/${selectedCategory}`);
    toast.success(`Filter ${selectedCategory} category`, { autoClose: 2000 });
  };

  const filteredSearchPizzas = (event) => {
    const value = event.target.value.toLowerCase(); // Convert the search value to lowercase
    const filteredPizzaData = pizzas.filter(pizza => {
      const nameMatch = pizza.name.toLowerCase().includes(value);
      const descriptionMatch = pizza.description.toLowerCase().includes(value);
      const categoryMatch = pizza.category.toLowerCase().includes(value);
      return nameMatch || descriptionMatch || categoryMatch;
    });

    setFilterPizza(filteredPizzaData);
  };

  if (loading && page === 1) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="header-menu-container">
        <Header dispatch={dispatch} />
      </div>
      <div className="pizza-menu-container1">
        <img src="/menu-pizza.jpg" alt="menu Banner" className="pizza-menu-image1" />
        <div className="pizza-menu-data-container">
          <h1 className="pizza-menu-head">Pizza Menu</h1>
          <h1 className="pizza-menu-quotes">
            Every pizza at Tasty Pizza is a celebration of taste, texture, and tradition
          </h1>
          <p className="pizza-menu-description">
            Experience the perfect blend of tradition and innovation at Tasty Pizza, where every slice is crafted with the finest ingredients. Savor the taste of excellence in every bite.
          </p>
        </div>
      </div>
      <h1 className='hurry-up'>Choose category</h1>
      <div className="category-container">
        <div className="types-category">
          <img src="/veggpizza1.png" className="category-image" alt="veg pizza" />
          <div className="category-data-containers">
            <h1 className="category-name">Veg Pizza</h1>
            <button className="category-button" onClick={() => handleCategoryClick('veg')}>Show</button>
          </div>
        </div>
        <div className="types-category">
          <img src="/nonveg-pizza.png" className="category-image" alt="non-veg pizza" />
          <div className="category-data-containers">
            <h1 className="category-name">Nonveg Pizza</h1>
            <button className="category-button" onClick={() => handleCategoryClick('non_veg')}>Show</button>
          </div>
        </div>
        <div className="types-category">
          <img src="/mix pizza.avif" className="category-image" alt="mixed pizza" />
          <div className="category-data-containers">
            <h1 className="category-name">Mix Pizza</h1>
            <button className="category-button" onClick={() => handleCategoryClick('mix')}>Show</button>
          </div>
        </div>
      </div>
      <h1 className='hurry-up'>Hurry Up! Order Now</h1>
      <label className='search-label'>
        Search Pizza:  
        <input type='search' onChange={filteredSearchPizzas} className='search-input' />
      </label>
      <ul className="pizza-list-container">
        {filterPizza.map((pizza, index) => (
          <PizzaList key={`${pizza._id}-${index}`} pizza={pizza} />
        ))}
      </ul>
      {page < totalPages && (
        <button className="showmore-button" onClick={onShowMore}>
          Show more...
        </button>
      )}
      <Footer />
    </>
  );
};

export default PizzaMenu;
