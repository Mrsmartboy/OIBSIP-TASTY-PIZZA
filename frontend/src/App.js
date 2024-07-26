import { useReducer,useEffect } from 'react';
import {BrowserRouter as Router,Routes,Route,Navigate} from 'react-router-dom'
 import PizzaSignup from './components/PizzaSignup';
 import PizzaLogin from './components/PizzaLogin';
 import ForgotPasswordForm from './components/ForgotPasswordForm/ForgotPasswordForm';
import ResetPasswordPage from './components/ResetPasswordPage/ResetPasswordPage';
 import Home from './components/Home';
 import PizzaMenu from './components/PizzaMenu';
import Cart from './components/Cart/Cart';
import PizzaDetails from './components/PizzaDetails';
import OrderDetails from './components/OrderDetails/OrderDetails';
import OrderTracking from './components/OrderTracking';
import PastOrders from './components/PastOrders/PastOrders';
 import Cookies from 'js-cookie' 
 import { CartProvider } from './components/CartContext';
 import AdminLogin from './components/AdminLogin';
 import CustomerOrderDetails from './components/CustomerOrderDetails';
 import PizzaUpdate from './components/PizzaUpdate/PizzaUpdate';
 import PizzaAnalysis from './components/PizzaAnalysis/PizzaAnalysis';
 import CustomerRatingDetails from './components/CustomerRatingDetails/CustomerRatingDetails';
 import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './App.css';


// Reducer Function 

const authReducer=(state,action)=>{
  switch (action.type){
    case 'LOGIN':
      return {...state,isAuthenticated:true};
      case 'LOGOUT':
      return {...state,isAuthenticated:false};
      case 'ADMIN_LOGIN':
        return {...state,isAuthenticatedAdmin:true};
        case 'ADMIN_LOGOUT':
        return {...state,isAuthenticatedAdmin:false};
      default :
         return state
  }
}

function App() {
      // Initialize state from Cookies or default to false if not present
  const initialState = {
    isAuthenticated: Cookies.get('isAuthenticated') === 'true' || false,
     isAuthenticatedAdmin: Cookies.get('adminToken') ? true : false
   
  };

  const [authState,dispatch] = useReducer(authReducer,initialState)

    // Effect to update Cookies when authState changes
    useEffect(() => {
     Cookies.set('isAuthenticated',authState.isAuthenticated,{expires:1})
    }, [authState.isAuthenticated]);
  

  return (
    <CartProvider>
    <Router>
    <div className="App"> 
    <ToastContainer />
      <Routes>
      <Route path='/signup' exact element={authState.isAuthenticated?<Navigate to="/" replace="true"/>:<PizzaSignup />} /> 
      <Route path='/login' exact element={authState.isAuthenticated?<Navigate to="/" replace="true"/>:<PizzaLogin dispatch={dispatch}/>} /> 
      <Route path='/forgot-password' exact element={authState.isAuthenticated?<Navigate to="/" replace="true"/>:<ForgotPasswordForm dispatch={dispatch}/>} /> 
      <Route path='/reset-password' exact element={authState.isAuthenticated?<Navigate to="/" replace="true"/>:<ResetPasswordPage dispatch={dispatch}/>} /> 

      <Route path='/' exact element={authState.isAuthenticated?<Home dispatch={dispatch} />:<Navigate to="/login" replace="true"/>}/>
      <Route path='/menu/:pizzaId' exact element={authState.isAuthenticated?<PizzaDetails dispatch={dispatch}/>:<Navigate to='/login'/>}/>
      <Route path='/menu/category/:category' exact element={authState.isAuthenticated?<PizzaMenu dispatch={dispatch} />:<Navigate to="/login" replace="true"/>}/>
      <Route path='/cart' exact element={authState.isAuthenticated?<Cart dispatch={dispatch}/>:<Navigate to='/login'/>}/>
      <Route path='/order-details' exact element={authState.isAuthenticated?<OrderDetails dispatch={dispatch}/>:<Navigate to='/login'/>}/>
      <Route path='/past-orders' exact element={authState.isAuthenticated?<PastOrders dispatch={dispatch}/>:<Navigate to='/login'/>}/>
      <Route path="/order-tracking/:orderId" element={authState.isAuthenticated?<OrderTracking dispatch={dispatch}/>:<Navigate to='/login'/>}/>
    
      <Route path="/admin/login"  element={authState.isAuthenticatedAdmin ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin dispatch={dispatch} />} />
      <Route path="/admin/customer-order-details" element={authState.isAuthenticatedAdmin ? <CustomerOrderDetails dispatch={dispatch} /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/pizza-update" element={authState.isAuthenticatedAdmin ? <PizzaUpdate dispatch={dispatch} /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/pizza-analysis" element={authState.isAuthenticatedAdmin ? <PizzaAnalysis dispatch={dispatch} /> : <Navigate to="/admin/login" replace />} />
      <Route path="/admin/customer-rating" element={authState.isAuthenticatedAdmin ? <CustomerRatingDetails dispatch={dispatch} /> : <Navigate to="/admin/login" replace />} />

      <Route path="*" element={<Navigate to="/"/>} />
    </Routes> 
    </div>
    </Router>
    </CartProvider>
  );
}

export default App;
