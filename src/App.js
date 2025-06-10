// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Quotation from './Quotation';
import ItemMaster from './components/ItemMaster';
import CustomerMaster from './components/CustomerMaster'; // New Import
import QuotationList from './components/QuotationList';
import PinGate from './PinGate'; // Ensure this path is correct

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'user' or 'owner'

  const handleAuthenticationSuccess = (type) => {
    setAuthenticated(true);
    setUserType(type);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUserType(null);
  };

  if (!authenticated) {
    return <PinGate onSuccess={handleAuthenticationSuccess} />;
  }

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: '"Times New Roman", Georgia, serif',
      backgroundColor: '#ecf0f1'
    },
    sidebar: {
      width: '200px',
      backgroundColor: '#2c3e50',
      padding: '0',
      boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
      borderRight: '3px solid #34495e',
      position: 'fixed', // Changed to fixed
      height: '100vh',   // Occupy full viewport height
      display: 'flex',   // Enable flexbox for internal layout
      flexDirection: 'column', // Stack children vertically
      justifyContent: 'space-between', // Distribute space
    },
    sidebarContent: { // New style to group navigation and header
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1, // Allow content to grow
    },
    sidebarHeader: {
      padding: '30px 25px',
      backgroundColor: '#34495e',
      borderBottom: '2px solid #2c3e50'
    },
    companyName: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#ecf0f1',
      margin: '0',
      textAlign: 'center',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      lineHeight: '1.3'
    },
    navigation: {
      padding: '30px 25px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      flexGrow: 1, // Allow navigation to grow
    },
    navLink: {
      textDecoration: 'none',
      display: 'block'
    },
    navButton: {
      width: '100%',
      padding: '16px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: 'inherit',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    createQuotationBtn: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    itemMasterBtn: {
      backgroundColor: '#27ae60',
      color: 'white'
    },
    viewQuotationsBtn: {
      backgroundColor: '#e67e22',
      color: 'white'
    },
    logoutButton: {
      backgroundColor: '#34495e', // Darker background to match sidebar
      color: '#ecf0f1', // Light text color
      border: 'none',
      borderRadius: '4px',
      padding: '10px 15px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'background-color 0.3s ease',
      marginBottom: '30px', // Spacing from footer
      width: '80%',
      alignSelf: 'center', // Center the button
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    mainContent: {
      flex: 1,
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      marginLeft: '200px', // Add margin-left to main content equal to sidebar width
      position: 'relative'
    },
    contentHeader: {
      backgroundColor: '#34495e',
      borderBottom: '3px solid #2c3e50',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    contentTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#ecf0f1',
      margin: '0',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    contentBody: {
      padding: '40px'
    },
    welcomeMessage: {
      textAlign: 'center',
      padding: '60px 40px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      margin: '0 auto',
      maxWidth: '600px'
    },
    welcomeTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '0 0 15px 0',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    welcomeText: {
      fontSize: '18px',
      color: '#7f8c8d',
      margin: '0',
      fontStyle: 'italic'
    },
    sidebarFooter: {
      textAlign: 'center',
      color: '#95a5a6',
      fontSize: '12px',
      fontStyle: 'italic',
      borderTop: '1px solid #34495e',
      paddingTop: '20px',
      paddingBottom: '20px', // Added padding bottom
      margin: '0 25px', // Horizontal padding matching header/nav
    }
  };

  return (
    <Router>
      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarContent}> {/* New wrapper for header and navigation */}
            <div style={styles.sidebarHeader}>
              <h5 style={styles.companyName}>Abinauv<br />Engineering</h5>
            </div>

            <nav style={styles.navigation}>
              <Link to="/quotation" style={styles.navLink}>
                <button
                  style={{
                    ...styles.navButton,
                    ...styles.createQuotationBtn
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#2980b9';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#3498db';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                >
                  Create Quotation
                </button>
              </Link>

              {/* Conditionally render Item Master link */}
              {userType === 'owner' && (
                <Link to="/items" style={styles.navLink}>
                  <button
                    style={{
                      ...styles.navButton,
                      ...styles.itemMasterBtn
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#229954';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#27ae60';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    Item Master
                  </button>
                </Link>
              )}

              {/* New Customer Master Link */}
              {userType === 'owner' && (
                <Link to="/customers" style={styles.navLink}>
                  <button
                    style={{
                      ...styles.navButton,
                      backgroundColor: '#9b59b6', // A distinct color for Customer Master
                      color: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#8e44ad';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#9b59b6';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    }}
                  >
                    Customer Master
                  </button>
                </Link>
              )}

              
            </nav>
          </div> {/* End sidebarContent */}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              ...styles.logoutButton,
            }}
          >
            Logout
          </button>

          {/* Sidebar Footer */}
          <div style={styles.sidebarFooter}>
            Professional Quotation System
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={styles.contentHeader}>
              {/* You can add a title or user info here if needed */}
          </div>
          
          <div style={styles.contentBody}>
            <Routes>
              <Route
                path="/"
                element={
                  <div style={styles.welcomeMessage}>
                    <h2 style={styles.welcomeTitle}>Welcome to Abinauv Engineering</h2>
                    <p style={styles.welcomeText}>
                      Select an option from the sidebar to begin managing your business operations.
                    </p>
                    {userType === 'owner' && <p style={{...styles.welcomeText, marginTop: '10px', fontWeight: 'bold'}}>You are logged in as an Owner.</p>}
                    {userType === 'user' && <p style={{...styles.welcomeText, marginTop: '10px', fontWeight: 'bold'}}>You are logged in as a User.</p>}
                  </div>
                }
              />
              <Route path="/quotation" element={<Quotation />} />
              {/* Protect the ItemMaster route */}
              <Route
                path="/items"
                element={userType === 'owner' ? <ItemMaster /> : <Navigate to="/" replace />}
              />
              {/* New Customer Master Route */}
              <Route
                path="/customers"
                element={userType === 'owner' ? <CustomerMaster /> : <Navigate to="/" replace />}
              />
              <Route path="/list" element={<QuotationList />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;