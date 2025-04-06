"use client"
import React, { useContext, useEffect, useState } from "react";
import "./styles.css"; 
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { toast} from "sonner";
const LoginPage = () => {
  const { isLoggedIn,setIsLoggedIn } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
      document.body.style.overflow = "auto";
    }
  }, [isLoggedIn, router]);
  
  // Handle input changes
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username || !password) {
      toast.error("All fields are required.");
    }

    try { 
      const response = await axios.post(
        `https://notecraft-backend-ag98.onrender.com/api/login/`,
        {
          username,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        }
      );
      
      const data = await response.data;

      if (response.status==200) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        localStorage.setItem("isLoggedIn", "true");

        toast.success("Logged in")
        setIsLoggedIn(true);
      } else {
        toast.error("Error Occured")
      }
    } catch (err) {
      toast.error("Unable to connect to server")
      console.log(err)
    }
    finally{
    }
  };

  return (
    <div className="mainbox">
      <div className="ring">
        <i className="ring-item"></i>
        <i className="ring-item"></i>
        <i className="ring-item"></i>

        <div className="login">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="inputBx">
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="inputBx">
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="inputBx">
              <input type="submit" value="Login" />
            </div>
          </form>
          <div className="links">
            Don't have an account?
            <Link className="link" href="/signup">
              {" "}
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoginPage);
