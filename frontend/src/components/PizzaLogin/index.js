import axios from "axios"
import { useState ,useCallback} from "react"
import { useNavigate } from "react-router-dom"
import HeaderSignLogin from "../HeaderSignLogin";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css'

const PizzaLogin =({dispatch}) =>{
    const [loginForm,setLoginForm] = useState({
        email:'',
        password:''
    })
    const [message,setMessage] = useState(null)
    const [showPassword,setShowPassword] = useState(false)
    const handleChange=(event)=>{
        const {name,value} = event.target
        setLoginForm({...loginForm,[name]:value})
    }

    const navigate= useNavigate();

    const onSignup=()=>{
          navigate("/signup",{replace:true})
    }
     
    const handleSubmit= useCallback(async (event)=>{
              event.preventDefault()
           const {email,password} = loginForm 
           try{
            const response = await axios.post('https://oibsip-tasty-pizza.onrender.com/api/login',{
                email,password
            })
          
            if(response.data.success){
                setMessage(response.data.message)
                const{ token,userId} = response.data
                localStorage.setItem('token',token)
                localStorage.setItem('userId',userId)
                toast.success("Login Successful!",{ autoClose: 2000})
               dispatch({type:'LOGIN'})
             
              
            }else{
                setMessage(response.data.message)
                toast.success(response.data.message,{ autoClose: 2000})

            }
         
            setLoginForm({
                email:'',
                password:''
            })
           }catch(error){
                 setMessage(error.response.data.message)
           }
    },[dispatch,loginForm])

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };


    return(
        <>
        <HeaderSignLogin/>
        <div className="pizza-login-container">
            
            <img src="/pizza-login.jpeg" alt="pizza" className="login-image"/>
            <form onSubmit={handleSubmit} className="login-container">
                <h1 className="login-head">Login</h1>
                <div className="login-items">
                   <label htmlFor="email" className="login-label">Email</label>
                   <input className="login-input" type="email" id="email" required placeholder="Email" value={loginForm.email}
                    name="email" onChange={handleChange}
                   />
                </div>
                <div className="login-items">
      <label htmlFor="password" className="login-label">Password</label>
      <div className="input-visible">
      <input 
        className="login-input" 
        type={showPassword ? "text" : "password"} 
        id="password" 
        required 
        placeholder="Password" 
        value={loginForm.password}
        name="password" 
        onChange={handleChange} 
      />
      <button type="button" onClick={togglePasswordVisibility} className="password-toggle-button">
        <img 
          src={showPassword ? '/eye.png' : '/invisible.png'} 
          alt={showPassword ? 'Hide password' : 'Show password'} 
          className="password-toggle-icon"
        />
      </button>
      </div>
    </div>
 
                <button type="submit" className="login-button">Login</button>
                 <button className="forgot-password" onClick={()=>navigate('/forgot-password')}>Forgot Password</button>    
                 <p className="login-message">{message}</p>
                 <p className="login-message-signup">If you are not register,then click on <span className="signup-link" onClick={onSignup}>Signup</span></p>
            </form>
        </div>
        </>
    )

}

export default PizzaLogin