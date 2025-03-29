"use client"
import React, { useState } from "react";
import "./styles.css"; // Ensure this CSS file exists in the correct path
import Link from "next/link";
import { useRouter } from "next/navigation";
const LoginPage = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

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
      setError("All fields are required.");
      return;
    }

    try {
      // Send a POST request to the backend API
      const response = await fetch(
        "http://127.0.0.1:8000/login/",
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
        localStorage.setItem("isLoggedIn", "true");


        router.push("/notespage");
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
