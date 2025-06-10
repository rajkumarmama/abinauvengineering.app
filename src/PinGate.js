// PinGate.js
import React, { useState } from 'react';

const ownerPIN = '897100'; // Owner PIN
const userPIN = '995500'; // User PIN

const PinGate = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (pin === ownerPIN) {
      onSuccess('owner'); // Pass 'owner' user type
    } else if (pin === userPIN) {
      onSuccess('user'); // Pass 'user' user type
    } else {
      setError('Incorrect PIN. Please try again.');
    }
    setPin(''); // Clear the PIN input
  };

  const styles = {
    centered: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: '"Times New Roman", Georgia, serif',
    },
    loginContainer: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      textAlign: 'center',
    },
    loginTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '30px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    input: {
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #bdc3c7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      fontFamily: 'inherit',
      backgroundColor: '#fff',
      marginBottom: '20px',
      width: '100%',
      maxWidth: '300px',
    },
    button: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'background-color 0.3s ease',
      minWidth: '100px',
    },
    errorMessage: {
      color: '#e74c3c',
      marginTop: '15px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  };

  return (
    <div style={styles.centered}>
      <div style={styles.loginContainer}>
        <h2 style={styles.loginTitle}>Enter PIN to Access System</h2>
        <input
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(''); // Clear error on new input
          }}
          placeholder="Enter PIN"
          style={styles.input}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button
          onClick={handleLogin}
          style={styles.button}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#229954')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#27ae60')}
        >
          Enter
        </button>
        {error && <p style={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};

export default PinGate;