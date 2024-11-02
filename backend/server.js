
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto')
const nodemailer = require('nodemailer');


const app = express();
const port = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://joseph:Joseph%40123@cluster0.cqxab0q.mongodb.net/Pizza?retryWrites=true&w=majority';
const dbName = 'Pizza';

app.use(cors());
app.use(express.json());

let db;

const CLIENT_URL= "https://josephtastypizza.vercel.app"



MongoClient.connect(mongoURI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });


  // configure nodemailer 

  const transporter = nodemailer.createTransport({
    service:'Gmail',
    auth:{
      user:'tastypizzadeliveryapp@gmail.com',
      pass:'lbow dgjr kbmd ayui'
    }
  })



// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, address, mobile, password } = req.body;
    const existingUser = await db.collection('users').findOne({ $or: [{ email }, { mobile }] });

    if (existingUser) {
      return res.status(400).send({ message: 'User already exists', success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomBytes(3).toString('hex');
    // Send OTP email
    const mailOptions = {
      from: 'tastypizzadeliveryapp@gmail.com',
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is ${otp}`,
    };
  
  await transporter.sendMail(mailOptions)
   // Store user with OTP in the database
   await db.collection('users').insertOne({
    name,
    email,
    address,
    mobile,
    password: hashedPassword,
    otp,
    verified: false,
  });

    res.status(200).send({ message: 'User signed up successfully', success: true });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).send({ message: 'Error signing up user', success: false });
  }
});

// verify otp 

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(400).send({ message: 'User not found', success: false });
    }

    if (user.otp === otp) {
      await db.collection('users').updateOne({ email }, { $set: { verified: true }, $unset: { otp: "" } });
      res.status(200).send({ message: 'Email verified successfully', success: true });
    } else {
      res.status(400).send({ message: 'Invalid OTP', success: false });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).send({ message: 'Error verifying OTP', success: false });
  }
});
// resend otp 

app.post('/api/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }

    // Generate and send OTP logic here
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to the user document or use another mechanism to store the OTP temporarily
    await db.collection('users').updateOne({ email }, { $set: { otp } });

    // Send OTP via email
    await transporter.sendMail({
      from: 'tastypizzadeliveryapp@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`
    });

    res.json({ message: 'OTP resent', success: true });
  } catch (error) {
    console.error('Error in resend-otp:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
});


// Route to handle forgot password request
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return res.status(404).send({ message: 'User not found', success: false });
    }

    // Generate a password reset token and expiry time
    const token = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Update the user document with the reset token and expiry
    await db.collection('users').updateOne(
      { email },
      { $set: { resetToken: token, resetTokenExpiry } }
    );

    // Send the password reset email
    const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from:'tastypizzadeliveryapp@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`
    });

    res.status(200).send({ message: 'Password reset link sent to your email', success: true });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).send({ message: 'Internal Server Error', success: false });
  }
});

// Route to handle password reset (this should be implemented on the frontend as well)
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({ message: 'Invalid or expired token', success: false });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user password and remove the reset token and expiry
    await db.collection('users').updateOne(
      { email: user.email },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpiry: "" }
      }
    );

    res.status(200).send({ message: 'Password reset successful', success: true });
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).send({ message: 'Internal Server Error', success: false });
  }
});


// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection('users').findOne({ email });
    const userId = user ? user._id : null;
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials', success: false });
    }
    
    if (!user.verified) {
      return res.status(401).json({ message: 'Email not verified', success: false });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
      res.json({ message: 'Login successful', success: true, token, userId });
    } else {
      res.status(401).json({ message: 'Invalid credentials', success: false });
    }
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal Server Error', success: false });
  }
});

// Add to Cart Route
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { dataDetails,quantity,pizza,discountPrice,eachUnitPrice} = req.body;
    const userId = req.user.userId; // Assuming userId is stored in token payload

    // Validate pizzaId
    if (!ObjectId.isValid(pizza._id)) {
      return res.status(400).json({ message: 'Invalid pizzaId' });
    }

    
    // Create a new cart item
  
    const cartItem = {
      userId: new ObjectId(userId),
      id:pizza.id,
      pizzaId: new ObjectId(pizza._id),
      cartId: new ObjectId(pizza.pizzaId),
      quantity: parseInt(quantity), // Default quantity to 1 if not provided
      name: pizza.name,
      toppings: pizza.toppings, // Ensure toppings is an array or handle accordingly
      category:pizza.category,
      imageUrl: pizza.imageUrl,
      totalPrice: discountPrice,
      unitPrice:eachUnitPrice,
      dataDetails:dataDetails || {}
    };
    

    // Save the cart item to the database
    await db.collection('cartItems').insertOne(cartItem);

    // Respond with the created cart item
    res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart', success: false });
  }
});

// quantity update  
app.put('/api/pizza-update',authenticateToken,async(req,res)=>{
  try{
    const {cartItems} = req.body;
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).send('Invalid request data.');
    }

    for (const item of cartItems) {
      const { pizzaId, quantity } = item;
     const data= await db.collection('pizzaMenu').updateOne(
        { _id: new ObjectId(pizzaId) },
        { $inc: { quantity: -quantity,quantitySold: +quantity} }
      );
     
    }
    res.status(200).json({ success: true, message: 'updated successfully' });

  }catch (error) {
    console.error('Error updating pizza quantities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
 


})




// Get Cart Items Route
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming userId is stored in token payload
    
    // Fetch cart items for the logged-in user
    const cartItems = await db.collection('cartItems').find({ userId: new ObjectId(userId) }).toArray();
    
    // Respond with the cart items
    res.status(200).json({ cart: { items: cartItems } });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', success: false });
  }
});

// Delete Cart Item Route
app.delete('/api/cart', authenticateToken, async (req, res) => {``
  try {
    const { cartId } = req.body;
    const userId = req.user.userId; // Assuming userId is stored in token payload
    await db.collection('cartItems').deleteOne({ userId: new ObjectId(userId), _id: new ObjectId(cartId) });
    res.status(200).json({ message: 'Item removed from cart', success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart', success: false });
  }
});

// Retrieve all pizza documents (protected route)
app.get('/api/pizzaData', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || 'all';
    const skip = (page - 1) * limit;
    const pizzaIds = req.query.pizzaIds ? req.query.pizzaIds.split(',') : [];
  
    let query = {};
    if (category !== 'all') {
      query.category = category;
    }
    if (pizzaIds.length > 0) {
      query._id = { $in: pizzaIds.map(id => new ObjectId(id)) };
    }

    const pizzas = await db.collection('pizzaMenu').find(query).skip(skip).limit(limit).sort({quantitySold:-1,price:1}).toArray();
    const totalPizzas = await db.collection('pizzaMenu').countDocuments(query);

    res.status(200).json({
      pizzas,
      totalPizzas,
      currentPage: page,
      totalPages: Math.ceil(totalPizzas / limit)
    });
  } catch (error) {
    console.error('Error retrieving pizzas:', error);
    res.status(500).json({ message: 'Error retrieving pizzas' });
  }
});

// Retrieve particular pizza
app.get('/api/pizzaDetails/:pizzaId', authenticateToken, async (req, res) => {
  try {
    const pizzaId = req.params.pizzaId;

    if (!ObjectId.isValid(pizzaId)) {
      return res.status(400).json({ message: 'Invalid pizzaId' });
    }

  
      const pizza = await db.collection('pizzaMenu').findOne({ _id: new ObjectId(pizzaId) });

    if (!pizza) {
      console.log('Pizza not found');
      return res.status(404).json({ message: 'Pizza not found' });
    }

    res.status(200).json(pizza);
  } catch (error) {
    console.error('Error retrieving pizza:', error);
    res.status(500).json({ message: 'Error retrieving pizza' });
  }
});

// retrieve pizza Extra Data 

app.get('/api/pizzaExtra',authenticateToken,async(req,res)=>{
  try{
    const data= await db.collection('pizzaDetails').findOne({})
    if (!data) {
      console.log('Pizza not found');
      return res.status(404).json({ message: 'Pizza details not found' });
    }

    res.status(200).json(data);

  }catch(err){
    console.error('Error retrieving pizza:', error);
    res.status(500).json({ message: 'Error retrieving pizza' });
  }
})

// Update Cart Item Quantity and price Route
app.put('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { cartId, quantity, totalPrice } = req.body;
    const userId = req.user.userId; // Assuming userId is stored in token payload
    if (!ObjectId.isValid(cartId)) {
      return res.status(400).json({ message: 'Invalid pizzaId' });
    }


    const cartItem = await db.collection('cartItems').findOne({ userId: new ObjectId(userId), _id: new ObjectId(cartId) });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await db.collection('cartItems').updateOne(
      { userId: new ObjectId(userId), _id: new ObjectId(cartId) },
      { $set: { quantity: parseInt(quantity), totalPrice: parseInt(totalPrice) } }
    );

    res.status(200).json({ message: 'Cart item quantity updated successfully', success: true });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    res.status(500).json({ message: 'Error updating cart item quantity', success: false });
  }
});

// Razorpay process
const razorpay = new Razorpay({
  key_id: 'rzp_test_DSy3lCncQ7ullG',
  key_secret: 'fKTIlqPt9zdYVAALu3tTisyj'
});

const MIN_ORDER_AMOUNT = 1; // Minimum order amount in paise (1 paise = 0.01 INR)

app.post('/api/create-order', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  // Check if amount is defined and valid
  if (typeof amount !== 'number' || amount < MIN_ORDER_AMOUNT) {
    return res.status(400).json({
      statusCode: 400,
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: `Order amount must be at least Rs.${MIN_ORDER_AMOUNT / 100}`,
        metadata: {},
        reason: 'input_validation_failed',
        source: 'order',
        step: 'payment_initiation',
      }
    });
  }

  try {
    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Math.random().toString(36).substr(2, 9)}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
});

// post the order details

app.post('/api/order-details', authenticateToken, async (req, res) => {
  try {
    // Extract data from request body
    const { cartItems, addressDetails,paymentDetails } = req.body;

   

    // Example: Save order details to MongoDB
    const newOrder ={
      cartItems: cartItems.map(item => ({
        userId:item.userId,
        cartId:item.cartId,
        pizzaId: item.pizzaId,
        pizzaName: item.pizzaName,
        pizzaQuantity: item.pizzaQuantity,
        pizzaDetails: item.pizzaDetails,
        pizzaPrice:item.price,
        unitPrice:item.unitPrice,
        toppings:item.toppings,
        category:item.category
      })),
      addressDetails: addressDetails,
      paymentDetails:paymentDetails
    };

    const savedOrder =  await db.collection('orderDetails').insertOne(newOrder);

    // Respond with success message or saved order data
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ error: 'Failed to process order. Please try again later.' });
  }
});

// get Order Details 
app.get('/api/order-details',authenticateToken,async(req,res)=>{
  try {
    const userId = req.query.userId;
   
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const orderDetails = await db.collection('orderDetails').find({ 'cartItems.userId': userId }).toArray();
    if (!orderDetails) {
      return res.status(201).json({ message: 'No order details found for this user' });
    }

    res.json(orderDetails);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }

})

// get past Orders 

app.get('/api/past-orders',authenticateToken,async(req,res)=>{
  try{
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const historyOrders = await db.collection('orderHistory').find({'cartItems.userId':userId}).toArray()
    if (!historyOrders) {
      return res.status(201).json({ message: 'No order details found for this user' });
    }
    res.status(200).json(historyOrders)

  } catch(error){
    console.error('Error fetching past Orders',error)
    res.status(500).json({message:'server error.pls checK server route'})
  }
})

// admin fetch the history data 

app.get('/api/admin/history-data',authenticateAdminToken,async(req,res)=>{
  try{
   
  
    const historyDetails = await db.collection('orderHistory').find({}).toArray()
    if (!historyDetails) {
      return res.status(201).json({ message: 'No history details found for this user' });
    }
    res.status(200).json(historyDetails)

  } catch(error){
    console.error('Error fetching history details',error)
    res.status(500).json({message:'server error.pls checK server route'})
  }
})


// get order details by id 
app.get('/api/track-details', authenticateToken, async (req, res) => {
  try {
    const orderId = req.query.orderId;
   
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const orderDetails = await db.collection('orderDetails').findOne({ _id: new ObjectId(orderId) });
    if (!orderDetails) {
      return res.status(201).json({ message: 'No order details found for this ID', success: false,data:{}});
    }
    
    res.status(200).json( orderDetails); // Ensure response format
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.',success:false });
  }
});

// post rating details 
app.post('/api/rateOrder',authenticateToken,async(req,res)=>{
  try{
   const {orderId,pizzaItem,rating,comment,isRatingGiven} = req.body 
    for (const  item of pizzaItem){
      const pizzaDetails={
        userId:item.userId,
        pizzaId:item.pizzaId,
        pizzaName:item.pizzaName,
        unitPrice:item.unitPrice,
        pizzaQuantity:item.pizzaQuantity,
        totalPrice:item.pizzaPrice,
        orderId:orderId,
        rating:rating,
        comment:comment,
        isRatingGiven:isRatingGiven
      }
      await db.collection('ratingDetails').insertOne({pizzaDetails})

    }
    res.status(200).json({message:"successful added",success:true})
  } catch(error){
    console.error('Error adding the order details',error)
    res.status(500).json({message:'server error',success:false})
  }
})

// get rating details 
app.get('/api/rateOrder/:orderId', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
   
    // Validate ObjectId
    if (!ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    // Fetch rating details from the database
    const ratingDetail = await db.collection('ratingDetails').findOne({
      'pizzaDetails.orderId': orderId  // Adjusted query to match the document structure
    });

    // Check if rating details exist
    if (!ratingDetail) {
      return res.status(404).json({ message: 'Rating details not found' });
    }

    // Send the rating details
    res.status(200).json(ratingDetail);

  } catch (error) {
    console.error('Error fetching the rating details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// get order ratings 

// Endpoint to get ratings for all orders of a specific user

app.get('/api/order-ratings', authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId; // Extract userId from query parameters

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find ratings based on the userId
    const ratings = await db.collection('ratingDetails').find({ 'pizzaDetails.userId': userId }).toArray();

    if (ratings.length === 0) {
      return res.status(404).json({ message: 'No ratings found for this user' });
    }

    res.status(200).json(ratings);

  } catch (error) {
    console.error('Error fetching order ratings:', error);
    res.status(500).json({ message: 'Server error', success: false });
  }
});

// verify payment
app.post('/api/verify-payment',authenticateToken, async(req,res)=>{
  
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body
    const generated_signature = crypto.createHmac('sha256', 'fKTIlqPt9zdYVAALu3tTisyj')
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');
    if (generated_signature === razorpay_signature) {
      // Payment is verified
      res.json({ success: true });
    } else {
      // Payment verification failed
      res.json({ success: false });
    }
  
})



const adminCredentials = {
  email: 'josephganjela@gmail.com',
  password: 'Joseph@123'
};

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === adminCredentials.email && password === adminCredentials.password) {
    const token = jwt.sign({ email }, 'your_jwt_secret_key');
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});




// Get Admin-only Order Details
app.get('/api/admin/order-details', authenticateAdminToken, async (req, res) => {
  try {
    const orderDetails = await db.collection('orderDetails').find({}).sort({'paymentDetails.Date':-1}).toArray();
    if (!orderDetails) {
      return res.status(404).json({ message: 'No order details found for this user' });
    }
    res.json(orderDetails);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// Route to update order status
app.put('/api/admin/order-details/:orderId', authenticateAdminToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;


    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const date = new Date();
    const hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = (hours % 12) + ':' + minutes + ' ' + ampm;

    const result = await db.collection('orderDetails').updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          'paymentDetails.status': status,
          'paymentDetails.time': strTime
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

app.put('/api/admin/pizza-update/:pizzaId',authenticateAdminToken,async(req,res)=>{
  try{
    const {pizzaId} = req.params 
    const {quantity} = req.body
    await db.collection('pizzaMenu').updateOne({_id:new ObjectId(pizzaId)},{$inc:{quantity:+quantity}})
    res.status(200).json({success:true})
  }catch{
    console.error('Error updating order details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
})

// route for delete completed orderId 
app.delete('/api/admin/order-details/:orderId', authenticateAdminToken, async (req, res) => {
  try {
    const { orderId } = req.params;
  

  

    const result = await db.collection('orderDetails').deleteOne(
      { _id: new ObjectId(orderId) }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully',success:true });
  } catch (error) {
    console.error('Error updating order details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// route to order history 

app.post('/api/admin/order-history', authenticateAdminToken, async (req, res) => {
  try {
    const { completedOrder, status,orderTime } = req.body;
    if (!completedOrder || !status) {
      return res.status(400).json({ message: 'Completed order details and status are required.' });
    }

    // Add status to the completedOrder document
    completedOrder.paymentDetails.status = status;

    const data = await db.collection('orderHistory').insertOne({...completedOrder,orderTime});

    res.status(200).json({ message: 'Order added in history', success: true, data: data });
  } catch (error) {
    console.error('Error adding order details:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// fetch Pizza Menu items 

app.get('/api/admin/pizza-details',authenticateAdminToken,async(req,res)=>{
  try{

    const responseData= await db.collection('pizzaMenu').find({quantity:{$lt:10}}).sort({quantity:1}).limit(10).toArray();
    res.status(200).json(responseData)

  }catch(error){
    console.error('Error fetching Pizza Menu details:', error);
    res.status(500).json({ message: 'Server error for  fetching pizza details. Please try again later.' });
  }
})

app.get('/api/admin/pizza-details/:pizzaId',authenticateAdminToken,async(req,res)=>{
  try{
   const {pizzaId} = req.params
    const responseData= await db.collection('pizzaMenu').findOne({_id:new ObjectId(pizzaId)});
    res.status(200).json(responseData)

  }catch(error){
    console.error('Error fetching Pizza Menu details:', error);
    res.status(500).json({ message: 'Server error for  fetching pizza details. Please try again later.' });
  }
})

// deleted pizzas posted

app.post('/api/admin/deleted-pizzas',authenticateAdminToken,async(req,res)=>{
  const {pizzaData} = req.body
  try{
   
    await db.collection('deletedPizzas').insertOne(pizzaData);
    res.status(200).json("deleted Pizza Inserted")

  }catch(error){
    console.error('Error posting deleted pizza details:', error);
    res.status(500).json({ message: 'Server error for  fetching pizza details. Please try again later.' });
  }
})

// delete the pizza 

app.delete('/api/admin/pizza-delete/:pizzaId',authenticateAdminToken,async(req,res)=>{
  try{
    const {pizzaId} = req.params
    await db.collection('pizzaMenu').deleteOne({_id:new ObjectId(pizzaId)});
     res.status(200).json("deleted successfully")
 
   }catch(error){
     console.error('Error deleting Pizza:', error);
     res.status(500).json({ message: 'Server error for  fetching pizza details. Please try again later.' });
   }
})

// fetch the rating details by admin 

app.get('/api/admin/rating-details', authenticateAdminToken, async (req, res) => {
  try {
    const responseData = await db.collection('ratingDetails').aggregate([
      {
        $group: {
          _id: '$pizzaDetails.userId',
          avgRating: { $avg: '$pizzaDetails.rating' },
          totalAmountSpend: { $sum: '$pizzaDetails.totalPrice' }
        }
      },
      {
        $sort: { totalAmountSpend: -1 }
      }
    ]).toArray(); // Convert the cursor to an array

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching Rating data:', error);
    res.status(500).json({ message: 'Server error for fetching rating details. Please try again later.' });
  }
});


app.get('/api/admin/user-data',authenticateAdminToken,async(req,res)=>{
  try{
    const responseData = await db.collection('users').find({}).toArray()
    res.status(200).json(responseData)

  }catch{
    console.error('Error fetching User data:', error);
    res.status(500).json({ message: 'Server error for  fetching user details. Please try again later.' });
  }
})




// Admin Middleware to verify JWT
function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.', success: false });

  jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.', success: false });
    req.user = user;
    next();
  });
}


// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.', success: false });
   
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.', success: false });
    req.user = user;
    next();
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
