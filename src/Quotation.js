import React, { useState, useEffect } from 'react';
import { db } from './components/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

function Quotation() {
  const [customerName, setCustomerName] = useState('');
  const [customerMaster, setCustomerMaster] = useState([]);
  const [items, setItems] = useState([{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  const [itemMaster, setItemMaster] = useState([]);

  useEffect(() => {
    const fetchItemMaster = async () => {
      const snapshot = await getDocs(collection(db, 'items'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItemMaster(data);
    };

    const fetchCustomerMaster = async () => {
      const snapshot = await getDocs(collection(db, 'customer'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomerMaster(data);
    };

    fetchItemMaster();
    fetchCustomerMaster();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'item') {
      newItems[index].item = value;
      const found = itemMaster.find(i => i.name.toLowerCase() === value.toLowerCase());
      newItems[index].rate = found ? found.rate : 0;
      newItems[index].stock = found ? found.stock || 0 : 0;
      newItems[index].amount = newItems[index].rate * newItems[index].qty;
    } else if (field === 'qty') {
      newItems[index].qty = parseInt(value) || 1;
      newItems[index].amount = newItems[index].rate * newItems[index].qty;
    }
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  };

  const deleteRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  };

  const total = items.reduce((sum, row) => sum + row.amount, 0);

  const handleSave = async () => {
    try {
      await addDoc(collection(db, 'quotations'), {
        customerName,
        items,
        total,
        createdAt: Timestamp.now(),
      });
      alert('Quotation saved to Firebase!');
      setCustomerName('');
      setItems([{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save quotation.');
    }
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
    header: {
      textAlign: 'center',
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
    subtitle: {
      fontSize: '16px',
      color: '#7f8c8d',
      margin: '8px 0 0 0',
      fontStyle: 'italic'
    },
    form: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    formGroup: {
      marginBottom: '25px',
      position: 'relative'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 'bold',
      color: '#34495e',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #bdc3c7',
      borderRadius: '4px',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s ease',
      fontFamily: 'inherit',
      backgroundColor: '#fff'
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      zIndex: 100,
      backgroundColor: 'white',

      borderTop: 'none',
      borderRadius: '0 0 4px 4px',
      maxHeight: '200px',
      overflowY: 'auto',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    dropdownItem: {
      padding: '12px 16px',
      cursor: 'pointer',
      borderBottom: '1px solid #ecf0f1',
      transition: 'background-color 0.2s ease',
      fontSize: '15px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '30px',
      border: '2px solid #34495e',
      backgroundColor: 'white'
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
    tableInput: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #bdc3c7',
      borderRadius: '3px',
      fontSize: '15px',
      fontFamily: 'inherit'
    },
    qtyInput: {
      width: '70px',
      padding: '8px 12px',
      border: '1px solid #bdc3c7',
      borderRadius: '3px',
      fontSize: '15px',
      textAlign: 'right',
      fontFamily: 'inherit'
    },
    stockInfo: {
      fontSize: '12px',
      color: '#27ae60',
      marginTop: '4px',
      fontWeight: 'bold'
    },
    deleteBtn: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease'
    },
    addBtn: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginBottom: '30px',
      transition: 'background-color 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    totalSection: {
      backgroundColor: '#ecf0f1',
      padding: '20px',
      borderRadius: '4px',
      border: '2px solid #34495e',
      marginBottom: '30px'
    },
    totalLabel: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2c3e50',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    totalAmount: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#27ae60',
      marginTop: '5px'
    },
    saveBtn: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '16px 40px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      transition: 'background-color 0.3s ease',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    },
    buttonContainer: {
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quotation System</h1>
      </div>

      <div style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter or select customer name"
            autoComplete="off"
            style={styles.input}
          />
          {customerName && (
            <div style={styles.dropdown}>
              {customerMaster
                .filter(cust =>
                  cust.name.toLowerCase().includes(customerName.toLowerCase()) &&
                  cust.name.toLowerCase() !== customerName.toLowerCase()
                )
                .slice(0, 5)
                .map(cust => (
                  <div
                    key={cust.id}
                    onClick={() => setCustomerName(cust.name)}
                    style={styles.dropdownItem}
                    onMouseDown={e => e.preventDefault()}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#3498db'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {cust.name}
                  </div>
                ))}
            </div>
          )}
        </div>

        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Item Description</th>
              <th style={{...styles.th, ...styles.thRight}}>Rate (₹)</th>
              <th style={{...styles.th, ...styles.thRight}}>Quantity</th>
              <th style={{...styles.th, ...styles.thRight}}>Amount (₹)</th>
              <th style={{...styles.th, ...styles.thCenter, borderRight: 'none'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr key={index}>
                <td style={{...styles.td, position: 'relative'}}>
                  <input
                    type="text"
                    value={row.item}
                    onChange={e => handleItemChange(index, 'item', e.target.value)}
                    placeholder="Type item name"
                    autoComplete="off"
                    style={styles.tableInput}
                  />
                  {row.stock > 0 && (
                    <div style={styles.stockInfo}>
                      Stock: {row.stock}
                    </div>
                  )}
                  {row.item && (
                    <div style={{...styles.dropdown, top: '100%'}}>
                      {itemMaster
                        .filter(item =>
                          item.name.toLowerCase().includes(row.item.toLowerCase()) &&
                          item.name.toLowerCase() !== row.item.toLowerCase()
                        )
                        .slice(0, 5)
                        .map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleItemChange(index, 'item', item.name)}
                            style={styles.dropdownItem}
                            onMouseDown={e => e.preventDefault()}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#3498db'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            {item.name}
                          </div>
                        ))}
                    </div>
                  )}
                </td>
                <td style={{...styles.td, ...styles.tdRight}}>
                  {row.rate.toFixed(2)}
                </td>
                <td style={{...styles.td, ...styles.tdRight}}>
                  <input
                    type="number"
                    min="1"
                    value={row.qty}
                    onChange={e => handleItemChange(index, 'qty', e.target.value)}
                    style={styles.qtyInput}
                  />
                </td>
                <td style={{...styles.td, ...styles.tdRight, fontWeight: 'bold'}}>
                  {row.amount.toFixed(2)}
                </td>
                <td style={{...styles.td, ...styles.tdCenter, borderRight: 'none'}}>
                  <button
                    onClick={() => deleteRow(index)}
                    style={styles.deleteBtn}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                    title="Delete Item"
                  >
                    &times;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={addRow}
          style={styles.addBtn}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
        >
          + Add Item
        </button>

        <div style={styles.totalSection}>
          <div style={styles.totalLabel}>Total</div>
          <div style={styles.totalAmount}>
            ₹{total.toFixed(2)}
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={handleSave}
            style={styles.saveBtn}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
          >
            Save Quotation
          </button>
        </div>
      </div>
    </div>
  );
}

export default Quotation;