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
  writeBatch,
} from 'firebase/firestore';

const ItemMaster = () => {
  // --- State Variables ---
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [itemNameError, setItemNameError] = useState('');
  const [itemRateError, setItemRateError] = useState('');
  const [itemStockError, setItemStockError] = useState('');
  const [activeTab, setActiveTab] = useState('newItem'); // New: State for active tab

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
      marginBottom: '30px', // Adjusted margin
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
      borderRadius: '0 0 8px 8px', // Rounded bottom corners only
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      border: '1px solid #e0e0e0',
      borderTop: 'none', // No top border as it connects to the tab
      marginBottom: '30px',
      minHeight: '400px', // Ensure consistent height
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
      '&:hover': {
        transform: 'translateY(-2px)',
      },
      '&:disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
      }
    },
    primaryButton: {
      backgroundColor: '#28a745',
      color: 'white',
      '&:hover': { backgroundColor: '#218838' },
      '&:disabled': { backgroundColor: '#a2d9a9' }
    },
    secondaryButton: {
      backgroundColor: '#007bff',
      color: 'white',
      '&:hover': { backgroundColor: '#0056b3' },
      '&:disabled': { backgroundColor: '#b0d8ff' }
    },
    editButton: {
      backgroundColor: '#ffc107',
      color: '#333',
      '&:hover': { backgroundColor: '#e0a800' },
      '&:disabled': { backgroundColor: '#ffeaa0' }
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      '&:hover': { backgroundColor: '#c82333' },
      '&:disabled': { backgroundColor: '#f5c6cb' }
    },
    uploadButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      '&:hover': { backgroundColor: '#5a6268' },
      '&:disabled': { backgroundColor: '#ced4da' }
    },
    deleteAllButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      marginTop: '20px', // More space after file input
      width: '100%',
      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
      '&:hover': { transform: 'scale(1.01)' },
      '&:disabled': { backgroundColor: '#f5c6cb' }
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
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      marginTop: '20px', // Margin above the table
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
      '&:first-child': { borderTopLeftRadius: '8px' },
      '&:last-child': { borderTopRightRadius: '8px' },
    },
    td: {
      padding: '12px 20px',
      borderBottom: '1px solid #e0e0e0',
      fontSize: '15px',
      backgroundColor: '#ffffff',
    },
    tdRight: { textAlign: 'right' },
    tdCenter: { textAlign: 'center' },
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

  // Helper function to apply hover and disabled styles dynamically
  const getButtonStyles = (baseStyle, isHovered, isDisabled) => {
    let finalStyle = { ...baseStyle };

    if (isHovered && baseStyle['&:hover']) {
      finalStyle = { ...finalStyle, ...baseStyle['&:hover'] };
    }
    if (isDisabled && baseStyle['&:disabled']) {
      finalStyle = { ...finalStyle, ...baseStyle['&:disabled'] };
    }
    // Remove pseudo-class styles from the direct style object
    delete finalStyle['&:hover'];
    delete finalStyle['&:disabled'];
    return finalStyle;
  };

  // --- Data Fetching ---
  const fetchItems = async () => {
    setLoading(true);
    setUploadStatus({ type: 'info', message: 'Fetching items...' });
    try {
      const snapshot = await getDocs(collection(db, 'items'));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(list);
      setFilteredItems(list);
      setUploadStatus(null);
    } catch (error) {
      console.error("Error fetching items:", error);
      setUploadStatus({ type: 'error', message: 'Failed to fetch items. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  // --- Handlers for New/Update Item Tab ---
  const handleSave = async () => {
    let isValid = true;
    setItemNameError('');
    setItemRateError('');
    setItemStockError('');

    if (!name.trim()) {
      setItemNameError('Item name cannot be empty.');
      isValid = false;
    }

    const rateValue = parseFloat(rate);
    if (isNaN(rateValue) || rateValue < 0) {
      setItemRateError('Enter a valid positive rate (e.g., 100.00).');
      isValid = false;
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      setItemStockError('Enter a valid positive stock quantity (e.g., 10).');
      isValid = false;
    }

    if (!isValid) {
      setUploadStatus({ type: 'error', message: 'Please correct the input errors in the form.' });
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, 'items', editingId), { name: name.trim(), rate: rateValue, stock: stockValue });
        setUploadStatus({ type: 'success', message: 'Item updated successfully!' });
      } else {
        await addDoc(collection(db, 'items'), { name: name.trim(), rate: rateValue, stock: stockValue });
        setUploadStatus({ type: 'success', message: 'Item added successfully!' });
      }

      // Clear form and reset state
      setName('');
      setRate('');
      setStock('');
      setEditingId(null);
      fetchItems(); // Re-fetch to update the list in "Item List" tab
    } catch (error) {
      console.error("Error saving item:", error);
      setUploadStatus({ type: 'error', message: `Failed to save item: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Item List Tab ---
  const handleEdit = (item) => {
    setName(item.name);
    setRate(item.rate.toString());
    setStock(item.stock?.toString() || '0');
    setEditingId(item.id);
    setActiveTab('newItem'); // Switch to "New Item" tab for editing
    setUploadStatus(null);
    setItemNameError('');
    setItemRateError('');
    setItemStockError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      setUploadStatus({ type: 'info', message: 'Deleting item...' });
      try {
        await deleteDoc(doc(db, 'items', id));
        fetchItems();
        setUploadStatus({ type: 'success', message: 'Item deleted successfully!' });
      } catch (error) {
        console.error("Error deleting item:", error);
        setUploadStatus({ type: 'error', message: `Failed to delete item: ${error.message}` });
      } finally {
        setLoading(false);
      }
    }
  };

  // --- Handlers for Bulk Actions Tab ---
  const handleDeleteAll = async () => {
    if (window.confirm('Are you absolutely sure you want to delete ALL items? This action cannot be undone and will permanently remove all item data.')) {
      setLoading(true);
      setUploadStatus({ type: 'info', message: 'Initiating bulk deletion of all items. This may take a moment...' });
      try {
        const snapshot = await getDocs(collection(db, 'items'));
        if (snapshot.empty) {
          setUploadStatus({ type: 'info', message: 'No items to delete.' });
          setLoading(false);
          return;
        }
        const batch = writeBatch(db);
        snapshot.docs.forEach(docSnap => {
          batch.delete(doc(db, 'items', docSnap.id));
        });
        await batch.commit();
        fetchItems();
        setUploadStatus({ type: 'success', message: `Successfully deleted ${snapshot.docs.length} items.` });
      } catch (error) {
        console.error("Error deleting all items:", error);
        setUploadStatus({ type: 'error', message: `Failed to delete all items: ${error.message}` });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'text/csv') {
        setUploadStatus({ type: 'error', message: 'Please select a valid CSV file.' });
        setCsvFile(null);
        document.getElementById('csvFileInput').value = '';
        return;
      }
      setCsvFile(file);
      setUploadStatus({ type: 'info', message: `File selected: ${file.name}` });
    } else {
      setCsvFile(null);
      setUploadStatus(null);
    }
  };

  const handleCSVUpload = () => {
    if (!csvFile) {
      setUploadStatus({ type: 'error', message: "Please select a CSV file first." });
      return;
    }

    setLoading(true);
    setUploadStatus({ type: 'info', message: 'Processing CSV and importing items...' });

    Papa.parse(csvFile, {
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
        const existingItemNames = new Set(items.map(item => item.name.toLowerCase()));

        for (const row of data) {
          const itemName = (row.name || '').trim();
          const itemRate = parseFloat(row.rate);
          const itemStock = parseInt(row.stock);

          if (itemName && !isNaN(itemRate) && itemRate >= 0 && !isNaN(itemStock) && itemStock >= 0) {
            if (existingItemNames.has(itemName.toLowerCase())) {
              skippedCount++;
              console.warn(`Skipping duplicate item found in current list: "${itemName}"`);
              continue;
            }

            const newItemRef = doc(collection(db, 'items'));
            batch.set(newItemRef, {
              name: itemName,
              rate: itemRate,
              stock: itemStock,
            });
            uploadedCount++;
          } else {
            skippedCount++;
            console.warn('Skipping row due to invalid/missing data:', row);
          }
        }

        try {
          await batch.commit();
          fetchItems();
          setCsvFile(null);
          document.getElementById('csvFileInput').value = '';
          setUploadStatus({ type: 'success', message: `CSV upload complete! ${uploadedCount} items added, ${skippedCount} skipped.` });
        } catch (error) {
          console.error("Error uploading CSV to Firestore:", error);
          setUploadStatus({ type: 'error', message: `Failed to upload CSV to database: ${error.message}` });
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setUploadStatus({ type: 'error', message: `Failed to parse CSV: ${error.message}` });
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
        <h1 style={styles.title}>Item Master Management</h1>
      </div>

      <div style={styles.tabContainer}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'newItem' && styles.activeTabButton) }}
          onClick={() => setActiveTab('newItem')}
          disabled={loading}
        >
          New Item
        </button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'itemList' && styles.activeTabButton) }}
          onClick={() => setActiveTab('itemList')}
          disabled={loading}
        >
          Item List
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
        {activeTab === 'newItem' && (
          <>
            <h2 style={{ ...styles.label, fontSize: '22px' }}>{editingId ? 'Update Existing Item' : 'Add New Item'}</h2>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Item Name:</label>
              <input
                type="text"
                value={name}
                placeholder="e.g., Laptop, Keyboard"
                onChange={e => setName(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
                disabled={loading}
              />
              {itemNameError && <p style={styles.errorMessage}>{itemNameError}</p>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Rate (₹):</label>
              <input
                type="number"
                value={rate}
                placeholder="e.g., 50000.00"
                onChange={e => setRate(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
                disabled={loading}
              />
              {itemRateError && <p style={styles.errorMessage}>{itemRateError}</p>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Stock Quantity:</label>
              <input
                type="number"
                value={stock}
                placeholder="e.g., 100"
                onChange={e => setStock(e.target.value)}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
                disabled={loading}
              />
              {itemStockError && <p style={styles.errorMessage}>{itemStockError}</p>}
            </div>

            <div style={styles.buttonRow}>
              {editingId ? (
                <>
                  <button
                    onClick={handleSave}
                    style={getButtonStyles(styles.primaryButton, false, loading)} // Pass false for isHovered in direct style application
                    onMouseEnter={(e) => e.target.style.backgroundColor = styles.primaryButton['&:hover'].backgroundColor}
                    onMouseLeave={(e) => e.target.style.backgroundColor = styles.primaryButton.backgroundColor}
                    disabled={loading}
                  >
                    Update Item
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setName(''); setRate(''); setStock(''); setUploadStatus(null); setItemNameError(''); setItemRateError(''); setItemStockError(''); }}
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
                  onClick={handleSave}
                  style={getButtonStyles(styles.secondaryButton, false, loading)}
                  onMouseEnter={(e) => e.target.style.backgroundColor = styles.secondaryButton['&:hover'].backgroundColor}
                  onMouseLeave={(e) => e.target.style.backgroundColor = styles.secondaryButton.backgroundColor}
                  disabled={loading}
                >
                  Add New Item
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'itemList' && (
          <>
            <input
              type="text"
              placeholder="Search items by name..."
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
                  <th style={styles.th}>Item Name</th>
                  <th style={{ ...styles.th, ...styles.tdRight }}>Rate (₹)</th>
                  <th style={{ ...styles.th, ...styles.tdRight }}>Stock Quantity</th>
                  <th style={{ ...styles.th, ...styles.tdCenter, borderRight: 'none' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="4" style={{ ...styles.td, ...styles.noItemsRow, borderRight: 'none' }}>
                      {searchTerm ? 'No items found matching your search.' : 'No items available. Add some items using the "New Item" tab.'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id}>
                      <td style={styles.td}>{item.name}</td>
                      <td style={{ ...styles.td, ...styles.tdRight, fontWeight: 'bold' }}>
                        ₹{item.rate ? parseFloat(item.rate).toFixed(2) : '0.00'}
                      </td>
                      <td style={{ ...styles.td, ...styles.tdRight }}>
                        {item.stock || 0}
                      </td>
                      <td style={{ ...styles.td, ...styles.tdCenter, borderRight: 'none' }}>
                        <button
                          onClick={() => handleEdit(item)}
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
                          title="Edit Item"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            ...getButtonStyles(styles.deleteButton, false, loading),
                            padding: '8px 15px',
                            fontSize: '14px',
                            minWidth: 'unset',
                            boxShadow: 'none',
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = styles.deleteButton['&:hover'].backgroundColor}
                          onMouseLeave={(e) => e.target.style.backgroundColor = styles.deleteButton.backgroundColor}
                          title="Delete Item"
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
              Total Displayed Items: {filteredItems.length} (out of {items.length} total)
            </div>
          </>
        )}

        {activeTab === 'bulkActions' && (
          <>
            <h2 style={{ ...styles.label, fontSize: '22px' }}>Bulk Actions</h2>
            
            <button
              onClick={handleDeleteAll}
              style={{
                ...getButtonStyles(styles.deleteAllButton, false, loading || items.length === 0),
                width: '25%' // Ensure full width
              }}
              onMouseEnter={(e) => { if (!loading && items.length > 0) e.target.style.backgroundColor = styles.deleteAllButton['&:hover'].backgroundColor; }}
              onMouseLeave={(e) => { if (!loading && items.length > 0) e.target.style.backgroundColor = styles.deleteAllButton.backgroundColor; }}
              disabled={loading || items.length === 0}
            >
              🗑 Delete All Items ({items.length})
            </button>
            <div style={styles.fileInputContainer}>
              <label style={styles.label}>Upload Items via CSV:</label>
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileChange}
                style={styles.fileInput}
                disabled={loading}
              />
              <button
                onClick={handleCSVUpload}
                style={{
                  ...getButtonStyles(styles.uploadButton, false, loading || !csvFile),
                  minWidth: 'auto',
                }}
                onMouseEnter={(e) => { if (!loading && csvFile) e.target.style.backgroundColor = styles.uploadButton['&:hover'].backgroundColor; }}
                onMouseLeave={(e) => { if (!loading && csvFile) e.target.style.backgroundColor = styles.uploadButton.backgroundColor; }}
                disabled={loading || !csvFile}
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
};

export default ItemMaster;