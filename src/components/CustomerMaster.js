import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from './firebase'; // Adjust path if your firebase.js is elsewhere
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

function CustomerMaster() {
  // --- State Variables ---
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]); // NEW: for search functionality
  const [searchTerm, setSearchTerm] = useState(''); // NEW: for search bar input
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [file, setFile] = useState(null); // State for selected CSV file
  const [uploadStatus, setUploadStatus] = useState(null); // Changed to null for no initial message
  const [loading, setLoading] = useState(false); // New loading state for all operations
  const [nameError, setNameError] = useState(''); // New state for input validation error
  const [activeTab, setActiveTab] = useState('newCustomer'); // New: State for active tab

  // --- Styles for the component ---
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '20px auto',
      fontFamily: '"Times New Roman", Georgia, serif',
      backgroundColor: '#f8f8f8',
      padding: '30px',
      borderRadius: '10px',
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
      minHeight: 'calc(100vh - 40px)',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      borderBottom: '3px solid #2c3e50',
      paddingBottom: '15px',
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '0',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
    },
    tabContainer: {
      display: 'flex',
      marginBottom: '20px',
      borderBottom: '2px solid #e0e0e0',
    },
    tabButton: {
      flex: 1,
      padding: '15px 20px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: 'none',
      borderBottom: '3px solid transparent',
      backgroundColor: 'transparent',
      color: '#6c757d',
      transition: 'all 0.3s ease',
      outline: 'none',
    },
    activeTabButton: {
      color: '#2c3e50',
      borderBottom: '3px solid #2c3e50',
      backgroundColor: 'white',
    },
    tabContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '0 0 8px 8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: '1px solid #e0e0e0',
      borderTop: 'none',
      marginBottom: '30px',
      minHeight: '400px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 'bold',
      color: '#34495e',
      fontSize: '15px',
    },
    input: {
      width: '100%',
      padding: '12px 15px',
      fontSize: '16px',
      border: '1px solid #bdc3c7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      outline: 'none',
      '&:focus': {
        borderColor: '#007bff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    buttonRow: {
      display: 'flex',
      gap: '15px',
      marginTop: '25px',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '12px 25px',
      fontSize: '16px',
      fontWeight: 'bold',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, opacity 0.3s ease, transform 0.2s ease',
      minWidth: '150px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    primaryButton: {
      backgroundColor: '#28a745',
      color: 'white',
      '&:hover': {
        backgroundColor: '#218838',
        transform: 'translateY(-2px)',
      },
      '&:disabled': {
        backgroundColor: '#a2d9a9',
        cursor: 'not-allowed',
      }
    },
    secondaryButton: {
      backgroundColor: '#007bff',
      color: 'white',
      '&:hover': {
        backgroundColor: '#0056b3',
        transform: 'translateY(-2px)',
      },
      '&:disabled': {
        backgroundColor: '#b0d8ff',
        cursor: 'not-allowed',
      }
    },
    editButton: {
      backgroundColor: '#ffc107',
      color: '#333',
      '&:hover': {
        backgroundColor: '#e0a800',
        transform: 'translateY(-2px)',
      },
      '&:disabled': {
        backgroundColor: '#ffeaa0',
        cursor: 'not-allowed',
      }
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      '&:hover': {
        backgroundColor: '#c82333',
        transform: 'translateY(-2px)',
      },
      '&:disabled': {
        backgroundColor: '#f5c6cb',
        cursor: 'not-allowed',
      }
    },
    bulkActionSection: {
      backgroundColor: '#e9ecef',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: 'inset 0 1px 5px rgba(0,0,0,0.05)',
      marginBottom: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '15px',
    },
    sectionTitle: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#34495e',
      marginBottom: '10px',
      borderBottom: '1px solid #b0c4de',
      paddingBottom: '8px',
      width: '100%',
    },
    fileInputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      width: '100%',
      marginBottom: '10px',
    },
    fileInput: {
      flex: 1,
      padding: '10px',
      fontSize: '15px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      backgroundColor: 'white',
    },
    uploadButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      '&:hover': {
        backgroundColor: '#5a6268',
      },
      '&:disabled': {
        backgroundColor: '#ced4da',
      }
    },
    deleteAllButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      marginTop: '15px',
      width: '100%',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      '&:hover': {
        backgroundColor: '#c82333',
        transform: 'scale(1.01)',
      },
      '&:disabled': {
        backgroundColor: '#f5c6cb',
        cursor: 'not-allowed',
      }
    },
    searchInput: { // Updated search input style
      width: '100%',
      padding: '12px 15px',
      fontSize: '16px',
      border: '1px solid #bdc3c7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      outline: 'none',
      marginBottom: '30px',
      marginTop: '10px', // Added top margin for separation
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      marginTop: '20px',
    },
    tableHeader: {
      backgroundColor: '#34495e',
      color: 'white',
    },
    th: {
      padding: '15px 20px',
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #2c3e50',
      '&:first-child': {
        borderTopLeftRadius: '8px',
      },
      '&:last-child': {
        borderTopRightRadius: '8px',
      },
    },
    td: {
      padding: '12px 20px',
      borderBottom: '1px solid #e0e0e0',
      fontSize: '15px',
      backgroundColor: '#ffffff',
    },
    tdRight: {
      textAlign: 'right',
    },
    tdCenter: {
      textAlign: 'center',
    },
    noItemsRow: {
      textAlign: 'center',
      fontStyle: 'italic',
      color: '#7f8c8d',
      padding: '20px',
      backgroundColor: '#fefefe',
    },
    totalItems: {
      textAlign: 'right',
      fontSize: '18px',
      fontWeight: 'bold',
      marginTop: '25px',
      color: '#2c3e50',
    },
    statusMessage: {
      marginTop: '15px',
      padding: '12px',
      borderRadius: '5px',
      border: '1px solid',
      textAlign: 'center',
      fontSize: '15px',
      fontWeight: '500',
    },
    successStatus: {
      backgroundColor: '#d4edda',
      borderColor: '#28a745',
      color: '#155724',
    },
    errorStatus: {
      backgroundColor: '#f8d7da',
      borderColor: '#dc3545',
      color: '#721c24',
    },
    infoStatus: {
      backgroundColor: '#e2e3e5',
      borderColor: '#6c757d',
      color: '#343a40',
    },
    errorMessage: {
      color: '#dc3545',
      fontSize: '12px',
      marginTop: '5px',
      marginBottom: '0px',
      fontWeight: '600',
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#2c3e50',
    },
    spinner: {
        border: '6px solid #f3f3f3',
        borderTop: '6px solid #3498db',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px',
    },
    '@keyframes spin': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    }
  };

  // Helper function to dynamically apply hover and disabled styles
  const getButtonStyles = (baseStyle, isHovered, isDisabled) => {
    let finalStyle = { ...baseStyle };

    if (isHovered && baseStyle['&:hover']) {
      finalStyle = { ...finalStyle, ...baseStyle['&:hover'] };
    }
    if (isDisabled && baseStyle['&:disabled']) {
      finalStyle = { ...finalStyle, ...baseStyle['&:disabled'] };
    }
    delete finalStyle['&:hover'];
    delete finalStyle['&:disabled'];
    return finalStyle;
  };


  useEffect(() => {
    fetchCustomers();
  }, []);

  // NEW: Filter customers whenever the list or search term changes
  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]); // Depend on searchTerm and customers

  // --- Fetch Customers ---
  const fetchCustomers = async () => {
    setLoading(true);
    setUploadStatus({ type: 'info', message: 'Fetching customers...' });
    try {
      const snapshot = await getDocs(collection(db, 'customer'));
      const customerData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customerData);
      // setFilteredCustomers will be updated by the useEffect above
      setUploadStatus(null);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setUploadStatus({ type: 'error', message: 'Failed to fetch customers. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Add Customer ---
  const handleAddCustomer = async () => {
    if (!newCustomerName.trim()) {
      setNameError('Customer name cannot be empty.');
      setUploadStatus({ type: 'error', message: 'Please enter a customer name.' });
      return;
    }
    setNameError('');

    setLoading(true);
    try {
      await addDoc(collection(db, 'customer'), {
        name: newCustomerName.trim(),
        contact: newCustomerContact.trim(),
        createdAt: Timestamp.now(),
      });
      setNewCustomerName('');
      setNewCustomerContact('');
      fetchCustomers();
      setUploadStatus({ type: 'success', message: 'Customer added successfully!' });
    } catch (error) {
      console.error('Error adding customer:', error);
      setUploadStatus({ type: 'error', message: `Failed to add customer: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Edit Customer (sets form fields) ---
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomerName(customer.name);
    setNewCustomerContact(customer.contact || '');
    setActiveTab('newCustomer');
    setUploadStatus(null);
    setNameError('');
  };

  // --- Handle Update Customer ---
  const handleUpdateCustomer = async () => {
    if (!editingCustomer || !newCustomerName.trim()) {
      setNameError('Customer name cannot be empty.');
      setUploadStatus({ type: 'error', message: 'Please enter a customer name.' });
      return;
    }
    setNameError('');

    setLoading(true);
    try {
      const customerRef = doc(db, 'customer', editingCustomer.id);
      await updateDoc(customerRef, {
        name: newCustomerName.trim(),
        contact: newCustomerContact.trim(),
      });
      setEditingCustomer(null);
      setNewCustomerName('');
      setNewCustomerContact('');
      fetchCustomers();
      setUploadStatus({ type: 'success', message: 'Customer updated successfully!' });
    } catch (error) {
      console.error('Error updating customer:', error);
      setUploadStatus({ type: 'error', message: `Failed to update customer: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Delete Customer ---
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setLoading(true);
      setUploadStatus({ type: 'info', message: 'Deleting customer...' });
      try {
        await deleteDoc(doc(db, 'customer', id));
        fetchCustomers();
        setUploadStatus({ type: 'success', message: 'Customer deleted successfully!' });
      } catch (error) {
        console.error('Error deleting customer:', error);
        setUploadStatus({ type: 'error', message: `Failed to delete customer: ${error.message}` });
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Handle Delete All Customers ---
  const handleDeleteAllCustomers = async () => {
    if (window.confirm('Are you absolutely sure you want to delete ALL customers? This action cannot be undone and will permanently remove all customer data.')) {
      setLoading(true);
      setUploadStatus({ type: 'info', message: 'Initiating bulk deletion of all customers. This may take a moment...' });
      try {
        const snapshot = await getDocs(collection(db, 'customer'));
        if (snapshot.empty) {
            setUploadStatus({ type: 'info', message: 'No customers to delete.' });
            setLoading(false);
            return;
        }
        const batch = writeBatch(db);
        snapshot.docs.forEach(docSnap => {
          batch.delete(doc(db, 'customer', docSnap.id));
        });
        await batch.commit();
        fetchCustomers();
        setUploadStatus({ type: 'success', message: `Successfully deleted ${snapshot.docs.length} customers.` });
      } catch (error) {
        console.error('Error deleting all customers:', error);
        setUploadStatus({ type: 'error', message: `Failed to delete all customers: ${error.message}` });
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Handle Cancel Edit ---
  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setNewCustomerName('');
    setNewCustomerContact('');
    setUploadStatus(null);
    setNameError('');
  };

  // --- Handle File Selection for CSV ---
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv') {
        setUploadStatus({ type: 'error', message: 'Please select a valid CSV file.' });
        setFile(null);
        document.getElementById('csvFileInput').value = '';
        return;
      }
      setFile(selectedFile);
      setUploadStatus({ type: 'info', message: `File selected: ${selectedFile.name}` });
    } else {
      setFile(null);
      setUploadStatus(null);
    }
  };

  // --- Handle CSV Upload ---
  const handleCsvUpload = () => {
    if (!file) {
      setUploadStatus({ type: 'error', message: 'Please select a CSV file first.' });
      return;
    }

    setLoading(true);
    setUploadStatus({ type: 'info', message: 'Uploading and processing CSV...' });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        if (!data || data.length === 0) {
          setUploadStatus({ type: 'error', message: 'CSV file is empty or has no valid data rows.' });
          setLoading(false);
          return;
        }

        const batch = writeBatch(db);
        let uploadedCount = 0;
        let skippedCount = 0;
        const existingCustomerNames = new Set(customers.map(c => c.name.toLowerCase()));

        for (const row of data) {
          const customerName = (row.Name || row.name || '').trim();
          const customerContact = (row.Contact || row.contact || '').trim();

          if (customerName) {
            if (existingCustomerNames.has(customerName.toLowerCase())) {
              skippedCount++;
              console.warn(`Skipping duplicate customer found in current list: "${customerName}"`);
              continue;
            }

            const customerRef = doc(collection(db, 'customer'));
            batch.set(customerRef, {
              name: customerName,
              contact: customerContact,
              createdAt: Timestamp.now(),
            });
            uploadedCount++;
          } else {
            skippedCount++;
            console.warn('Skipping row due to missing customer name:', row);
          }
        }

        try {
          await batch.commit();
          fetchCustomers();
          setFile(null);
          document.getElementById('csvFileInput').value = '';
          setUploadStatus({
            type: 'success',
            message: `CSV uploaded successfully! ${uploadedCount} customers added, ${skippedCount} skipped.`
          });
        } catch (error) {
          console.error('Error uploading CSV to Firestore:', error);
          setUploadStatus({ type: 'error', message: `Failed to upload CSV to database: ${error.message}` });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setUploadStatus({ type: 'error', message: `Error parsing CSV file: ${error.message}` });
        setLoading(false);
      }
    });
  };

  return (
    <div style={styles.container}>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
          <p>Processing request, please wait...</p>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Customer Master</h1>
      </div>

      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'newCustomer' && styles.activeTabButton) }}
          onClick={() => setActiveTab('newCustomer')}
          disabled={loading}
        >
          New Customer
        </button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'customerList' && styles.activeTabButton) }}
          onClick={() => setActiveTab('customerList')}
          disabled={loading}
        >
          Customer List
        </button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'bulkActions' && styles.activeTabButton) }}
          onClick={() => setActiveTab('bulkActions')}
          disabled={loading}
        >
          Bulk Actions
        </button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === 'newCustomer' && (
          <>
            <h2 style={styles.sectionTitle}>{editingCustomer ? 'Update Existing Customer' : 'Add New Customer'}</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Customer Name:</label>
              <input
                type="text"
                value={newCustomerName}
                placeholder="e.g., John Doe"
                onChange={(e) => setNewCustomerName(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
                disabled={loading}
              />
              {nameError && <p style={styles.errorMessage}>{nameError}</p>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contact Info (Optional):</label>
              <input
                type="text"
                value={newCustomerContact}
                placeholder="e.g., 9876543210, john.doe@example.com"
                onChange={(e) => setNewCustomerContact(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
                disabled={loading}
              />
            </div>

            <div style={styles.buttonRow}>
              {editingCustomer ? (
                <>
                  <button
                    onClick={handleUpdateCustomer}
                    style={getButtonStyles(styles.primaryButton, false, loading)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = styles.primaryButton['&:hover'].backgroundColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = styles.primaryButton.backgroundColor}
                    disabled={loading}
                  >
                    Update Customer
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={getButtonStyles(styles.deleteButton, false, loading)}
                    onMouseEnter={(e) => e.target.style.backgroundColor = styles.deleteButton['&:hover'].backgroundColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = styles.deleteButton.backgroundColor}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddCustomer}
                  style={getButtonStyles(styles.secondaryButton, false, loading)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = styles.secondaryButton['&:hover'].backgroundColor}
                  onMouseLeave={(e) => e.target.style.backgroundColor = styles.secondaryButton.backgroundColor}
                  disabled={loading}
                >
                  Add New Customer
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'customerList' && (
          <>
            <h2 style={styles.sectionTitle}>Existing Customers</h2>
            {/* NEW: Search Input */}
            <input
              type="text"
              placeholder="Search customers by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
              disabled={loading}
            />

            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Contact</th>
                  <th style={{ ...styles.th, ...styles.tdCenter }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="3" style={{ ...styles.td, ...styles.noItemsRow }}>
                      {searchTerm ? 'No customers found matching your search.' : 'No customers available. Add some using the "New Customer" tab.'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td style={styles.td}>{customer.name}</td>
                      <td style={styles.td}>{customer.contact || 'N/A'}</td>
                      <td style={{ ...styles.td, ...styles.tdCenter }}>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          style={{
                            ...getButtonStyles(styles.editButton, false, loading),
                            padding: '8px 15px',
                            fontSize: '14px',
                            minWidth: 'unset',
                            boxShadow: 'none',
                            marginRight: '8px',
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = styles.editButton['&:hover'].backgroundColor}
                          onMouseLeave={(e) => e.target.style.backgroundColor = styles.editButton.backgroundColor}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          style={{
                            ...getButtonStyles(styles.deleteButton, false, loading),
                            padding: '8px 15px',
                            fontSize: '14px',
                            minWidth: 'unset',
                            boxShadow: 'none',
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = styles.deleteButton['&:hover'].backgroundColor}
                          onMouseLeave={(e) => e.target.style.backgroundColor = styles.deleteButton.backgroundColor}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={styles.totalItems}>
              Total Displayed Customers: {filteredCustomers.length} (out of {customers.length} total)
            </div>
          </>
        )}

        {activeTab === 'bulkActions' && (
          <>
            <h2 style={styles.sectionTitle}>Bulk Actions</h2>
             <button
              onClick={handleDeleteAllCustomers}
              style={{
                ...getButtonStyles(styles.deleteAllButton, false, loading || customers.length === 0),
                width: '25%'
              }}
              onMouseEnter={(e) => { if (!loading && customers.length > 0) e.target.style.backgroundColor = styles.deleteAllButton['&:hover'].backgroundColor; }}
              onMouseLeave={(e) => { if (!loading && customers.length > 0) e.target.style.backgroundColor = styles.deleteAllButton.backgroundColor; }}
              disabled={loading || customers.length === 0}
            >
              🗑 Delete All Customers ({customers.length})
            </button>
            <div style={styles.fileInputContainer}>
              <label style={styles.label}>Upload Customers via CSV:</label>
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileChange}
                style={styles.fileInput}
                disabled={loading}
              />
              <button
                onClick={handleCsvUpload}
                style={{
                  ...getButtonStyles(styles.uploadButton, false, loading || !file),
                  minWidth: 'auto',
                }}
                onMouseEnter={(e) => { if (!loading && file) e.target.style.backgroundColor = styles.uploadButton['&:hover'].backgroundColor; }}
                onMouseLeave={(e) => { if (!loading && file) e.target.style.backgroundColor = styles.uploadButton.backgroundColor; }}
                disabled={loading || !file}
              >
                Upload CSV
              </button>
            </div>

            {uploadStatus && (
              <div
                style={{
                  ...styles.statusMessage,
                  ...(uploadStatus.type === 'success' && styles.successStatus),
                  ...(uploadStatus.type === 'error' && styles.errorStatus),
                  ...(uploadStatus.type === 'info' && styles.infoStatus),
                }}
              >
                {uploadStatus.message}
              </div>
            )}

           
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerMaster;