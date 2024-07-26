import { useNavigate } from 'react-router-dom';
import './pizzaList.css'




const PizzaList = ({pizza}) => {

  const discountPrice= Math.floor(pizza.price-pizza.price*pizza.discountPrice/100)
  const navigate = useNavigate()

  const handleOrderNow=()=>{
  
     navigate(`/menu/${pizza._id}`)
  }

 

  return (
          
            <li key={pizza._id}  className='list-container'>
              
              <img src={pizza.imageUrl} alt={pizza.name} className='pizza-item-image'/>
              <h3 className='item-name' >{pizza.name}</h3>
              <p className='item-description'>{pizza.description}</p>
              <div className='price-data-container'>
              <p className='item-price-discount'>Rs:{pizza.price}</p>
                <p className='item-price'>Rs:{discountPrice}</p>
              </div>
           
              <button className='add-cart-button' onClick={handleOrderNow}>Order Now</button>
            </li>
  
  )
};

export default PizzaList;
