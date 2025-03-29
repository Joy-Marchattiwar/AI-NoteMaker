"use client"
import React, { useState } from "react";
import "../login/styles.css"; // Ensure this CSS file exists in the correct path
import Link from "next/link";

const SignupPage = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  // State for error messages
  const [error, setError] = useState("");

  // Handle input changes
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
      setError("All fields are required.");
      return;
    }

    try {
      // Send a POST request to the backend API
      const response = await fetch(
        "http://127.0.0.1:8000/signup/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            "confirm_password":confirmPassword
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        alert("User registered successfully!");
        // Optionally redirect to the login page
        window.location.href = "/login";
      } else {
        // Handle backend errors
        setError(data.message || "An error occurred during registration.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
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
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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

export default SignupPage;
