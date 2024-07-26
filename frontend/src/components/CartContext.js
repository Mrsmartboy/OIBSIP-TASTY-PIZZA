import React, { createContext, useReducer, useContext, useEffect,useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'SET_CART':
      return {
        ...state,
        items: action.payload,
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload.cartId),
      };
    case 'UPDATE_CART_ITEM':
      return {
        ...state,
        items: state.items.map(item => {
          if (item._id === action.payload.cartId) {
            return {
              ...item,
              quantity: action.payload.quantity,
              totalPrice: action.payload.updatedPrice, // Update price as well
            };
          }
          return item;
        }),
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = useCallback(async (dataDetails,quantity,pizza,discountPrice,eachUnitPrice) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add items to the cart',{ autoClose: 2000});
      return;
    }

    try { 
      const response = await axios.post(
        'https://oibsip-tasty-pizza.onrender.com/api/cart',
        { pizza, quantity,discountPrice,dataDetails,eachUnitPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({ type: 'ADD_TO_CART', payload: response.data });
      toast.success('Item added to cart',{ autoClose: 2000});
    } catch (error) {
      handleApiError(error, 'Error adding item to cart');
    }
  },[]);

  const removeFromCart = useCallback(async (cartId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to remove items from the cart',{ autoClose: 2000});
      return;
    }

    try {
      await axios.delete('https://oibsip-tasty-pizza.onrender.com/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
        data: { cartId }
      });
      dispatch({ type: 'REMOVE_FROM_CART', payload: { cartId } });
    } catch (error) {
      handleApiError(error, 'Error removing item from cart');
    }
  },[]);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to view the cart',{ autoClose: 2000});
      return;
    }

    try {
      const response = await axios.get('https://oibsip-tasty-pizza.onrender.com/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch({ type: 'SET_CART', payload: response.data.cart.items });
    } catch (error) {
      handleApiError(error, 'Error fetching cart');
    }
  },[]);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCartItem = useCallback(async (cartId, quantity, totalPrice) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to update items in the cart',{ autoClose: 2000});
      return;
    }

    try {
      await axios.put(
        'https://oibsip-tasty-pizza.onrender.com/api/cart',
        { cartId, quantity, totalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { cartId, quantity, totalPrice } });
      toast.success('Cart item updated',{ autoClose: 2000});
    } catch (error) {
      handleApiError(error, 'Error updating cart item');
    }
  },[]);

  const handleApiError = (error, message = 'An error occurred. Please try again later.') => {
    if (error.response) {
      console.error('Server responded with status code:', error.response.status);
      console.error('Error details:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    toast.error(message,{ autoClose: 2000});
  };

  return (
    <CartContext.Provider value={{ state, addToCart, removeFromCart, updateCartItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
