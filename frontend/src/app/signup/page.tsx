"use client"
import React, { useState } from "react";
import "../login/styles.css"; // Ensure this CSS file exists in the correct path
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";

const SignupPage = () => {

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });


  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e:React.FocusEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { username, password, confirmPassword } = formData;

    // Basic validation
    if (!username || !password || !confirmPassword) {
      toast.warning("All fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        `https://notecraft-backend-ag98.onrender.com/api/signup/`,
        {
          username,
          password,
          confirm_password: confirmPassword,
        } ,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.data;

      if (response.status==201) {
        toast.success("Signed Up")
        window.location.href = "/login";
      } else {
        // Handle backend errors
        toast.error("An error occurred during registration.");
      }
    } catch (err) {
      toast.error("Failed to connect to the server.");
    }
  };

  return (
    <div className="mainbox">
      <div className="ring">
        <i className="ring-item"></i>
        <i className="ring-item"></i>
        <i className="ring-item"></i>

        <div className="login">
          <h2>Sign Up</h2>
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
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="inputBx">
              <input type="submit" value="Sign Up" />
            </div>
          </form>
          <div className="links">
            Already have an account?
            <Link className="link" href="/login">
              {" "}
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SignupPage);
