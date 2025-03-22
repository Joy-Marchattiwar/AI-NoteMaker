import React from "react";
import "../login/styles.css"; // Make sure you have this CSS file in the correct path
import Link from "next/link";
const SignupPage = () => {
  return (
    <div className="mainbox">
      <div className="ring">
        <i className="ring-item"></i>
        <i className="ring-item"></i>
        <i className="ring-item"></i>

        <div className="login">
          <h2>Sign Up</h2>
          <div className="inputBx">
            <input type="text" placeholder="Username" />
          </div>
          <div className="inputBx">
            <input type="password" placeholder="Password" />
          </div>
          <div className="inputBx">
            <input type="password" placeholder="Confirm Password" />
          </div>
          <div className="inputBx">
            <input type="submit" value="Sign Up" />
          </div>
          <div className="links">
          Already have an account?
            <Link className="link" href="/login"> Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
