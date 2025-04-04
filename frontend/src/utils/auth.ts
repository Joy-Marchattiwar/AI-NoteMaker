export const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch("http://127.0.0.1:8000/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: localStorage.getItem("refreshToken"),
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        // Store the new access token
        localStorage.setItem("accessToken", data.access);
        return true;
      } else {
        // If refresh token is also invalid, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        // Redirect to login page
        window.location.href = "/login";
        return false;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  };