import React, { useState, useEffect, useRef } from 'react';
import { db } from './components/firebase';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function QuotationManager() {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'list'
  const [customerName, setCustomerName] = useState('');
  const [customerMaster, setCustomerMaster] = useState([]);
  const [items, setItems] = useState([{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  const [itemMaster, setItemMaster] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showItemDropdownIndex, setShowItemDropdownIndex] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const quotationRefs = useRef({});
  const [editingQuotationId, setEditingQuotationId] = useState(null); // State to hold the ID of the quotation being edited

  // --- Common Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      const itemSnapshot = await getDocs(collection(db, 'items'));
      const itemData = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItemMaster(itemData);

      const customerSnapshot = await getDocs(collection(db, 'customer'));
      const customerData = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomerMaster(customerData);

      fetchQuotations(); // Fetch quotations on initial load
    };
    fetchData();
  }, []);

  const fetchQuotations = async () => {
    const snapshot = await getDocs(collection(db, 'quotations'));
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortedList = list.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    setQuotations(sortedList);
    setFilteredResults(sortedList);
  };

  // --- Search Functionality ---
  useEffect(() => {
    const results = quotations.filter(q =>
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(results);
  }, [searchTerm, quotations]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleResultClick = (id) => {
    if (quotationRefs.current[id]) {
      quotationRefs.current[id].scrollIntoView({ behavior: 'smooth', block: 'start' });
      setSearchTerm('');
      setActiveTab('list'); // Switch to list tab when a search result is clicked
    }
  };

  // --- Quotation Creation/Editing Logic ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'item') {
      newItems[index].item = value;
      const found = itemMaster.find(i => i.name.toLowerCase() === value.toLowerCase());
      newItems[index].rate = found ? found.rate : 0;
      newItems[index].stock = found ? found.stock || 0 : 0;
      newItems[index].amount = newItems[index].rate * newItems[index].qty;
      if (found && value.toLowerCase() === found.name.toLowerCase()) {
        setShowItemDropdownIndex(null);
      }
    } else if (field === 'qty') {
      newItems[index].qty = parseInt(value) || 1;
      newItems[index].amount = newItems[index].rate * newItems[index].qty;
    }
    setItems(newItems);
  };

  const handleCustomerSelect = (name) => {
    setCustomerName(name);
    setShowCustomerDropdown(false);
  };

  const handleItemSelect = (index, name) => {
    handleItemChange(index, 'item', name);
    setShowItemDropdownIndex(null);
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
      if (editingQuotationId) {
        // Update existing quotation
        const quotationRef = doc(db, 'quotations', editingQuotationId);
        await updateDoc(quotationRef, {
          customerName,
          items,
          total,
          updatedAt: Timestamp.now(),
        });
        alert('Quotation updated successfully!');
      } else {
        // Save new quotation
        await addDoc(collection(db, 'quotations'), {
          customerName,
          items,
          total,
          createdAt: Timestamp.now(),
        });
        alert('Quotation saved to Firebase!');
      }
      resetForm();
      fetchQuotations(); // Refresh the list of quotations
      setActiveTab('list'); // Switch to list tab after saving
    } catch (error) {
      console.error('Error saving/updating:', error);
      alert('Failed to save/update quotation.');
    }
  };

  const handleEdit = (quotation) => {
    setEditingQuotationId(quotation.id);
    setCustomerName(quotation.customerName);
    setItems(quotation.items);
    setActiveTab('create'); // Switch to create tab for editing
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      await deleteDoc(doc(db, 'quotations', id));
      alert("Quotation deleted.");
      fetchQuotations();
    }
  };

  const resetForm = () => {
    setEditingQuotationId(null);
    setCustomerName('');
    setItems([{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  };

  // --- PDF Download Functionality ---
  const downloadPDF = (q) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Quotation", 105, 15, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Customer Name: ${q.customerName}`, 14, 30);
    doc.text(`Date: ${q.createdAt?.toDate?.().toLocaleDateString() || ''}`, 14, 38);
    doc.line(14, 42, 196, 42);

    autoTable(doc, {
      startY: 48,
      head: [['Item Name', 'Rate', 'Qty', 'Amount']],
      body: q.items.map(i => [
        i.item,
        `Rs. ${i.rate}`,
        i.qty,
        `Rs. ${i.amount}`
      ]),
      styles: { halign: 'center' },
      headStyles: { fillColor: [22, 160, 133], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 },
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: Rs. ${q.total}`, 180, finalY + 10, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("Thank you for your business!", 105, finalY + 30, { align: 'center' });

    doc.save(`Quotation_${q.customerName}_${q.id}.pdf`);
  };

  // --- Styles ---
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '"Times New Roman", Georgia, serif',
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      boxSizing: 'border-box',
      padding: '20px'
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
    tabs: {
      display: 'flex',
      marginBottom: '30px',
      justifyContent: 'center',
      borderBottom: '2px solid #bdc3c7'
    },
    tabButton: {
      padding: '15px 30px',
      fontSize: '18px',
      fontWeight: 'bold',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      outline: 'none',
      transition: 'color 0.3s ease, border-bottom 0.3s ease',
      color: '#7f8c8d',
      borderBottom: '3px solid transparent',
    },
    tabButtonActive: {
      color: '#34495e',
      borderBottom: '3px solid #3498db',
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
      border: '1px solid #e0e0e0',
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
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      marginRight: '10px',
    },
    cancelEditBtn: {
      backgroundColor: '#f39c12',
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
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    buttonContainer: {
      textAlign: 'center'
    },
    // Styles for QuotationList part
    searchContainer: {
      position: 'relative',
      marginBottom: '30px',
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    searchLabel: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 'bold',
      color: '#34495e',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
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
      backgroundColor: '#fff'
    },
    noQuotations: {
      textAlign: 'center',
      fontSize: '18px',
      color: '#7f8c8d',
      fontStyle: 'italic',
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    },
    quotationCard: {
      backgroundColor: 'white',
      marginBottom: '30px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      overflow: 'hidden'
    },
    cardHeader: {
      backgroundColor: '#34495e',
      color: 'white',
      padding: '20px 25px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    customerName: {
      fontSize: '20px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    cardTotalAmount: { // Renamed to avoid conflict with `totalAmount`
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'white'
    },
    dateInfo: {
      backgroundColor: '#ecf0f1',
      padding: '12px 25px',
      fontSize: '14px',
      color: '#2c3e50',
      fontWeight: 'bold',
      borderBottom: '1px solid #bdc3c7'
    },
    table_list: { // Renamed to avoid conflict with `table`
      width: '100%',
      borderCollapse: 'collapse',
      margin: '0'
    },
    tableHeader_list: { // Renamed to avoid conflict with `tableHeader`
      backgroundColor: '#f8f9fa'
    },
    th_list: { // Renamed to avoid conflict with `th`
      padding: '15px 12px',
      textAlign: 'left',
      fontWeight: 'bold',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderRight: '1px solid #dee2e6',
      borderBottom: '2px solid #34495e',
      color: '#2c3e50'
    },
    thRight_list: { // Renamed to avoid conflict with `thRight`
      textAlign: 'right'
    },
    td_list: { // Renamed to avoid conflict with `td`
      padding: '12px',
      borderRight: '1px solid #dee2e6',
      borderBottom: '1px solid #dee2e6',
      fontSize: '15px'
    },
    tdRight_list: { // Renamed to avoid conflict with `tdRight`
      textAlign: 'right',
      fontWeight: 'bold'
    },
    buttonContainer_list: { // Renamed to avoid conflict with `buttonContainer`
      padding: '20px 25px',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #dee2e6',
      display: 'flex',
      gap: '12px'
    },
    downloadButton: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'background-color 0.3s ease'
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'background-color 0.3s ease'
    },
    editButton: {
      backgroundColor: '#f39c12',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      transition: 'background-color 0.3s ease'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quotation Management System</h1>
      </div>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'create' ? styles.tabButtonActive : {}) }}
          onClick={() => { setActiveTab('create'); resetForm(); }}
          onMouseEnter={(e) => e.target.style.color = '#34495e'}
          onMouseLeave={(e) => activeTab !== 'create' && (e.target.style.color = '#7f8c8d')}
        >
          {editingQuotationId ? 'Edit Quotation' : 'Create New Quotation'}
        </button>
        <button
          style={{ ...styles.tabButton, ...(activeTab === 'list' ? styles.tabButtonActive : {}) }}
          onClick={() => setActiveTab('list')}
          onMouseEnter={(e) => e.target.style.color = '#34495e'}
          onMouseLeave={(e) => activeTab !== 'list' && (e.target.style.color = '#7f8c8d')}
        >
          View Quotations
        </button>
      </div>

      {activeTab === 'create' && (
        <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => {
                setCustomerName(e.target.value);
                setShowCustomerDropdown(true);
              }}
              onFocus={() => setShowCustomerDropdown(true)}
              onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 100)}
              placeholder="Enter or select customer name"
              autoComplete="off"
              style={styles.input}
            />
            {showCustomerDropdown && customerName && (
              <div style={styles.dropdown}>
                {customerMaster
                  .filter(cust =>
                    cust.name.toLowerCase().includes(customerName.toLowerCase())
                  )
                  .slice(0, 100)
                  .map(cust => (
                    <div
                      key={cust.id}
                      onClick={() => handleCustomerSelect(cust.name)}
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
                <th style={{ ...styles.th, ...styles.thRight }}>Rate (₹)</th>
                <th style={{ ...styles.th, ...styles.thRight }}>Quantity</th>
                <th style={{ ...styles.th, ...styles.thRight }}>Amount (₹)</th>
                <th style={{ ...styles.th, ...styles.thCenter, borderRight: 'none' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, index) => (
                <tr key={index}>
                  <td style={{ ...styles.td, position: 'relative' }}>
                    <input
                      type="text"
                      value={row.item}
                      onChange={e => handleItemChange(index, 'item', e.target.value)}
                      onFocus={() => setShowItemDropdownIndex(index)}
                      onBlur={() => setTimeout(() => setShowItemDropdownIndex(null), 100)}
                      placeholder="Type item name"
                      autoComplete="off"
                      style={styles.tableInput}
                    />
                    {row.stock > 0 && (
                      <div style={styles.stockInfo}>
                        Stock: {row.stock}
                      </div>
                    )}
                    {showItemDropdownIndex === index && row.item && (
                      <div style={{ ...styles.dropdown, top: '100%' }}>
                        {itemMaster
                          .filter(item =>
                            item.name.toLowerCase().includes(row.item.toLowerCase())
                          )
                          .slice(0, 100)
                          .map(item => (
                            <div
                              key={item.id}
                              onClick={() => handleItemSelect(index, item.name)}
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
                  <td style={{ ...styles.td, ...styles.tdRight }}>
                    {row.rate.toFixed(2)}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdRight }}>
                    <input
                      type="number"
                      min="1"
                      value={row.qty}
                      onChange={e => handleItemChange(index, 'qty', e.target.value)}
                      style={styles.qtyInput}
                    />
                  </td>
                  <td style={{ ...styles.td, ...styles.tdRight, fontWeight: 'bold' }}>
                    {row.amount.toFixed(2)}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter, borderRight: 'none' }}>
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
              {editingQuotationId ? 'Update Quotation' : 'Save Quotation'}
            </button>
            {editingQuotationId && (
              <button
                onClick={resetForm}
                style={styles.cancelEditBtn}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <>
          <div style={styles.searchContainer}>
            <label style={styles.searchLabel}>Search Quotations</label>
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#3498db'}
              onBlur={(e) => e.target.style.borderColor = '#bdc3c7'}
            />
            {searchTerm && (
              <div style={{ ...styles.dropdown, left: '25px', right: '25px' }}>
                {filteredResults.map(q => (
                  <div
                    key={q.id}
                    onClick={() => handleResultClick(q.id)}
                    style={styles.dropdownItem}
                    onMouseDown={e => e.preventDefault()}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#3498db'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {q.customerName} - ₹{q.total?.toFixed(2)}
                  </div>
                ))}
                {filteredResults.length === 0 && (
                  <div style={styles.dropdownItem}>No results found</div>
                )}
              </div>
            )}
          </div>

          {quotations.length === 0 && (
            <div style={styles.noQuotations}>
              No quotations found. Create your first quotation to get started.
            </div>
          )}

          {quotations.map(q => (
            <div
              key={q.id}
              style={styles.quotationCard}
              ref={el => (quotationRefs.current[q.id] = el)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.customerName}>{q.customerName}</div>
                <div style={styles.cardTotalAmount}>Total: ₹{q.total?.toFixed(2)}</div>
              </div>

              <div style={styles.dateInfo}>
                Created: {q.createdAt?.toDate?.().toLocaleString() || 'No date available'}
              </div>

              <table style={styles.table_list}>
                <thead style={styles.tableHeader_list}>
                  <tr>
                    <th style={styles.th_list}>Item Description</th>
                    <th style={{ ...styles.th_list, ...styles.thRight_list }}>Rate (₹)</th>
                    <th style={{ ...styles.th_list, ...styles.thRight_list }}>Quantity</th>
                    <th style={{ ...styles.th_list, ...styles.thRight_list, borderRight: 'none' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {q.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td style={styles.td_list}>{item.item}</td>
                      <td style={{ ...styles.td_list, ...styles.tdRight_list }}>
                        {item.rate?.toFixed(2)}
                      </td>
                      <td style={{ ...styles.td_list, ...styles.tdRight_list }}>
                        {item.qty}
                      </td>
                      <td style={{ ...styles.td_list, ...styles.tdRight_list, borderRight: 'none' }}>
                        {item.amount?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={styles.buttonContainer_list}>
                <button
                  onClick={() => downloadPDF(q)}
                  style={styles.downloadButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                  title="Download PDF"
                >
                  📄 Download PDF
                </button>
                <button
                  onClick={() => handleEdit(q)}
                  style={styles.editButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}
                  title="Edit Quotation"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                  title="Delete Quotation"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default QuotationManager;