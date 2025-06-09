import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const correctPIN = '3355';

const ItemMaster = () => {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [stock, setStock] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, 'items'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(list);
    setFilteredItems(list);
  };

  useEffect(() => {
    if (authenticated) fetchItems();
  }, [authenticated]);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleLogin = () => {
    if (pin === correctPIN) {
      setAuthenticated(true);
      setPin('');
    } else {
      alert('Incorrect PIN');
    }
  };

  const handleSave = async () => {
    if (!name || !rate || stock === '') return alert('Please fill all fields');
    const rateValue = parseFloat(rate);
    const stockValue = parseInt(stock);

    if (isNaN(rateValue) || rateValue < 0) return alert('Enter a valid rate');
    if (isNaN(stockValue) || stockValue < 0) return alert('Enter a valid stock');

    if (editingId) {
      await updateDoc(doc(db, 'items', editingId), { name, rate: rateValue, stock: stockValue });
    } else {
      await addDoc(collection(db, 'items'), { name, rate: rateValue, stock: stockValue });
    }

    setName('');
    setRate('');
    setStock('');
    setEditingId(null);
    fetchItems();
  };

  const handleEdit = (item) => {
    setName(item.name);
    setRate(item.rate.toString());
    setStock(item.stock?.toString() || '0');
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteDoc(doc(db, 'items', id));
      fetchItems();
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL items?')) {
      const snapshot = await getDocs(collection(db, 'items'));
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'items', docSnap.id)));
      await Promise.all(deletePromises);
      fetchItems();
      alert("All items deleted");
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setName('');
    setRate('');
    setStock('');
    setEditingId(null);
    setItems([]);
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleCSVUpload = () => {
    if (!csvFile) return alert("Please choose a CSV file first");

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const itemsToAdd = results.data.filter(row => row.name && row.rate && row.stock !== undefined);
        for (const row of itemsToAdd) {
          const rate = parseFloat(row.rate);
          const stock = parseInt(row.stock);
          if (!isNaN(rate) && !isNaN(stock)) {
            await addDoc(collection(db, 'items'), {
              name: row.name,
              rate: rate,
              stock: stock,
            });
          }
        }
        fetchItems();
        setCsvFile(null);
        alert("CSV uploaded successfully");
      },
    });
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '"Times New Roman", Georgia, serif',
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      boxSizing: 'border-box'
    },
    centered: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      fontFamily: '"Times New Roman", Georgia, serif'
    },
    loginContainer: {
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      textAlign: 'center'
    },
    loginTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '30px',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      borderBottom: '3px solid #2c3e50',
      paddingBottom: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '0',
      letterSpacing: '1px',
      textTransform: 'uppercase'
    },
    form: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      marginBottom: '30px'
    },
    inputRow: {
      display: 'flex',
      gap: '15px',
      marginBottom: '25px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    input: {
      flex: 1,
      minWidth: '200px',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #bdc3c7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      fontFamily: 'inherit',
      backgroundColor: '#fff'
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
      minWidth: '100px'
    },
    secondaryButton: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'background-color 0.3s ease'
    },
    deleteAllButton: {
      backgroundColor: '#e74c3c',
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
      marginBottom: '20px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #bdc3c7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      fontFamily: 'inherit',
      backgroundColor: '#fff',
      marginBottom: '25px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: 'white',
      border: '2px solid #34495e',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    tableHeader: {
      backgroundColor: '#34495e',
      color: 'white'
    },
    th: {
      padding: '15px 12px',
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderRight: '1px solid #2c3e50'
    },
    thRight: {
      textAlign: 'right'
    },
    thCenter: {
      textAlign: 'center'
    },
    td: {
      padding: '12px',
      borderRight: '1px solid #bdc3c7',
      borderBottom: '1px solid #bdc3c7',
      fontSize: '15px'
    },
    tdRight: {
      textAlign: 'right'
    },
    tdCenter: {
      textAlign: 'center'
    },
    editButton: {
      backgroundColor: '#f39c12',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      padding: '6px 12px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginRight: '8px',
      transition: 'background-color 0.3s ease'
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      padding: '6px 12px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    },
    fileInput: {
      flex: 1,
      minWidth: '300px',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #bdc3c7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      fontFamily: 'inherit',
      backgroundColor: '#fff'
    },
    noItemsRow: {
      textAlign: 'center',
      fontStyle: 'italic',
      color: '#7f8c8d',
      padding: '20px'
    }
  };

  if (!authenticated) {
    return (
      <div style={styles.centered}>
        <div style={styles.loginContainer}>
          <h2 style={styles.loginTitle}>Enter PIN to Access Item Master</h2>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter 4-digit PIN"
            style={styles.input}
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
          />
          <br /><br />
          <button 
            onClick={handleLogin} 
            style={styles.button}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Item Master Management</h1>
        <button 
          onClick={handleLogout} 
          style={styles.secondaryButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
        >
          ⬅ Logout
        </button>
      </div>

      <div style={styles.form}>
        <div style={styles.inputRow}>
          <input
            type="text"
            value={name}
            placeholder="Enter Item Name"
            onChange={e => setName(e.target.value)}
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#3498db'}
            onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
          />
          <input
            type="number"
            value={rate}
            placeholder="Enter Rate (₹)"
            onChange={e => setRate(e.target.value)}
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#3498db'}
            onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
          />
          <input
            type="number"
            value={stock}
            placeholder="Enter Stock Quantity"
            onChange={e => setStock(e.target.value)}
            style={styles.input}
            onFocus={(e) => e.target.style.borderColor = '#3498db'}
            onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
          />
          <button 
            onClick={handleSave} 
            style={styles.button}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
          >
            {editingId ? 'Update Item' : 'Add Item'}
          </button>
        </div>

        <div style={styles.inputRow}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            style={styles.fileInput}
          />
          <button 
            onClick={handleCSVUpload} 
            style={styles.button}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
          >
            Upload CSV
          </button>
        </div>

        <input
          type="text"
          placeholder="Search items by name..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) => e.target.style.borderColor = '#3498db'}
          onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
        />

        <button 
          onClick={handleDeleteAll} 
          style={styles.deleteAllButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
        >
          🗑 Delete All Items
        </button>
      </div>

      <table style={styles.table}>
        <thead style={styles.tableHeader}>
          <tr>
            <th style={styles.th}>Item Name</th>
            <th style={{...styles.th, ...styles.thRight}}>Rate (₹)</th>
            <th style={{...styles.th, ...styles.thRight}}>Stock Quantity</th>
            <th style={{...styles.th, ...styles.thCenter, borderRight: 'none'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <tr key={item.id}>
                <td style={styles.td}>{item.name}</td>
                <td style={{...styles.td, ...styles.tdRight, fontWeight: 'bold'}}>
                  ₹{item.rate.toFixed(2)}
                </td>
                <td style={{...styles.td, ...styles.tdRight}}>
                  {item.stock || 0}
                </td>
                <td style={{...styles.td, ...styles.tdCenter, borderRight: 'none'}}>
                  <button 
                    onClick={() => handleEdit(item)} 
                    style={styles.editButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}
                    title="Edit Item"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    style={styles.deleteButton}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                    title="Delete Item"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{...styles.td, ...styles.noItemsRow, borderRight: 'none'}}>
                {searchTerm ? 'No items found matching your search' : 'No items available. Add some items to get started.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ItemMaster;