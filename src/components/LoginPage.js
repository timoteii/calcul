import React from 'react';

const LoginPage = () => {

  const handleLogin = () => {
    window.location.href = '/.netlify/functions/auth';
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default LoginPage;