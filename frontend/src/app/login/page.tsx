import React, { useState } from "react";
import "./styles.css"; // Ensure this CSS file exists in the correct path
import Link from "next/link";

const LoginPage = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // State for error messages
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    // Basic validation
    if (!username || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      // Send a POST request to the backend API
      const response = await fetch(
        "http://your-backend-url/api/accounts/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Login successful
        alert("Login successful!");
        // Store the JWT token (e.g., in localStorage or cookies)
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        // Redirect to a protected page or dashboard
        window.location.href = "/dashboard";
      } else {
        // Handle backend errors
        setError(data.message || "Invalid username or password.");
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
          <h2>Login</h2>
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
              <input type="submit" value="Sign in" />
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

export default LoginPage;
