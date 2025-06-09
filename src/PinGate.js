import React, { useState } from 'react';

function PinGate({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    // allow only numbers and max 4 digits
    if (/^\d{0,4}$/.test(val)) {
      setPin(val);
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === '9955') {
      onSuccess();
    } else {
      setError('Incorrect PIN. Try again.');
      setPin('');
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2>Enter 4-digit PIN to access the app</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <input
          type="password"
          value={pin}
          onChange={handleChange}
          maxLength={4}
          style={{
            fontSize: 24,
            padding: '10px 15px',
            width: 150,
            textAlign: 'center',
            letterSpacing: '0.3em',
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
          autoFocus
        />
        <button
          type="submit"
          style={{
            marginLeft: 15,
            padding: '10px 20px',
            fontSize: 16,
            borderRadius: 6,
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Enter
        </button>
      </form>
      {error && (
        <div style={{ color: 'red', marginTop: 15, fontWeight: 'bold' }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default PinGate;
