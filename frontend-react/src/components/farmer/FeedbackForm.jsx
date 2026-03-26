import React, { useState } from 'react';
import axios from 'axios';

function FeedbackForm({ onFeedbackSubmit, product }) {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`/api/farmer/products/${product.id}/feedback`, { comment, rating });
            onFeedbackSubmit();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} />
            <input type="number" min="1" max="5" value={rating} onChange={(event) => setRating(event.target.value)} />
            <button type="submit">Submit Feedback</button>
        </form>
    );
}

export default FeedbackForm;