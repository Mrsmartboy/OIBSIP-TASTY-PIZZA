import React, { useState,useCallback } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import axios from 'axios';
import './RatingModal.css'; // Ensure this CSS file exists

const RatingModal = ({ isOpen, onRequestClose, order, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // Track submission status

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      setIsSubmitted(true); // Set submission status


      await axios.post('https://oibsip-tasty-pizza.onrender.com/api/rateOrder', {
        orderId: order._id,
        pizzaItem: order.cartItems,
        rating,
        comment,
        isRatingGiven:true
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Rating submitted successfully", { autoClose: 2000 });
      onRatingSubmit(order._id); // Notify parent component
      onRequestClose(); // Close modal
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Error submitting rating. Please try again later.', { autoClose: 2000 });
    }
  },[comment,onRatingSubmit,onRequestClose,order._id,order.cartItems,rating]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="rating-modal">
      <h2>Rate Your Order</h2>
      <div className="star-rating">
        <p>Rate your ordered dishes</p>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${rating >= star ? 'selected' : ''} ${isSubmitted ? 'disabled' : ''}`} // Apply disabled class
            onClick={() => !isSubmitted && handleRatingChange(star)} // Prevent changes after submission
          >
            ★
          </span>
        ))}
      </div>
      <div className="comment-container">
        <p>Add a detailed review</p>
        <textarea
          className='textarea-rating'
          value={comment}
          onChange={handleCommentChange}
          disabled={isSubmitted} // Disable textarea after submission
        />
      </div>
      <button className="rating-button" onClick={handleSubmit} disabled={isSubmitted}>Submit</button> {/* Disable button after submission */}
    </Modal>
  );
};

export default RatingModal;
