import React from "react";
import "./styles.css"; // Make sure you have this CSS file in the correct path
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="mainbox">
    <div className="ring">
      <i className="ring-item"></i>
        <i className="ring-item"></i>
        <i className="ring-item"></i>

      <div className="login">
        <h2>Login</h2>
        <div className="inputBx">
          <input type="text" placeholder="Username" />
        </div>
        <div className="inputBx">
          <input type="password" placeholder="Password" />
        </div>
        <div className="inputBx">
          <input type="submit" value="Sign in" />
        </div>
        <div className="links">
          Dont have an account?
          <Link className="link"href="/signup">Signup</Link>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LoginPage;
