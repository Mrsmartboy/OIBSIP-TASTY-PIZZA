

# Tasty Pizza

## Introduction
Tasty Pizza is an online pizza ordering system designed to offer users a seamless experience in selecting and ordering their favorite pizzas. The application provides a wide variety of pizza options, including different sizes, bases, sauces, cheeses, and toppings. Users can sign up, log in, manage their profiles, and view order histories, making it a comprehensive platform for pizza lovers.

## Features
- **User Authentication**: Secure signup and login functionality with password visibility toggle and validation.
- **Pizza Selection**: Wide variety of pizzas with multiple categories (veg, non-veg, mix).
- **Customizable Orders**: Options for selecting pizza base, cheese, sauce, and toppings.
- **Shopping Cart**: Add, remove, and manage pizza orders in the cart.
- **Order History**: View past orders and their details.
- **Responsive Design**: User-friendly interface optimized for both desktop and mobile devices.

## Tech Stack
- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **State Management**: React `useReducer`, `useState`, `useEffect`
- **Authentication**: JSON Web Tokens (JWT), Cookies

## Installation and Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Mrsmartboy/OIBSIP-TASTY-PIZZA.git
   cd OIBSIP-TASTY-PIZZA
   ```

2. **Install dependencies**:
   - For the frontend:
     ```bash
     cd frontend
     npm install
     ```
   - For the backend:
     ```bash
     cd backend
     npm install
     ```

3. **Set up environment variables**:
   - Create a `.env` file in the `backend` directory and add the following:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the application**:
   - Start the backend server:
     ```bash
     cd backend
     npm start
     ```
   - Start the frontend development server:
     ```bash
     cd frontend
     npm start
     ```

5. **Open your browser** and navigate to `http://localhost:3000` to view the application.

## Usage
- **Signup/Login**: Users can sign up for a new account or log in to an existing one. Password visibility toggle and validation are included for better user experience.
- **Browse Pizzas**: Users can browse through a variety of pizzas categorized as veg, non-veg, and mix.
- **Customize Orders**: Users can customize their pizzas by selecting the base, cheese, sauce, and toppings.
- **Add to Cart**: Customized pizzas can be added to the shopping cart.
- **Checkout**: Users can proceed to checkout to place their orders.
- **Order History**: Users can view their past orders and reorder their favorite pizzas.

## Contribution
We welcome contributions from the community. To contribute to Tasty Pizza:
1. **Fork the repository**.
2. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes**:
   ```bash
   git commit -m 'Add some feature'
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a pull request** on GitHub.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements
- Thanks to Oasis Infobyte for the opportunity to work on this project during the internship.


