import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Quotation from './Quotation';
import ItemMaster from './components/ItemMaster';
import QuotationList from './components/QuotationList';
import PinGate from './PinGate';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <PinGate onSuccess={() => setAuthenticated(true)} />;
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
      position: 'relative'
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
      gap: '20px'
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
    mainContent: {
      flex: 1,
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      position: 'relative'
    },
    contentHeader: {
      backgroundColor: '#34495e',
      borderBottom: '3px solid #2c3e50'
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
      position: 'absolute',
      bottom: '30px',
      left: '25px',
      right: '25px',
      textAlign: 'center',
      color: '#95a5a6',
      fontSize: '12px',
      fontStyle: 'italic',
      borderTop: '1px solid #34495e',
      paddingTop: '20px'
    }
  };

  return (
    <Router>
      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
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
            
            <Link to="/list" style={styles.navLink}>
              <button
                style={{
                  ...styles.navButton,
                  ...styles.viewQuotationsBtn
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d35400';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#e67e22';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
              View Quotations
              </button>
            </Link>
          </nav>
          
          {/* Sidebar Footer */}
          <div style={styles.sidebarFooter}>
            Professional Quotation System
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={styles.contentHeader}>
     
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
                  </div>
                } 
              />
              <Route path="/quotation" element={<Quotation />} />
              <Route path="/items" element={<ItemMaster />} />
              <Route path="/list" element={<QuotationList />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;