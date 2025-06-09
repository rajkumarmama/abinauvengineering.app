import React, { useEffect, useState, useRef } from 'react';
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function QuotationList() {
  const [quotations, setQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const quotationRefs = useRef({});

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

  useEffect(() => {
    fetchQuotations();
  }, []);

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
    }
  };

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      await deleteDoc(doc(db, 'quotations', id));
      alert("Quotation deleted.");
      fetchQuotations();
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
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: '25px',
      right: '25px',
      zIndex: 100,
      backgroundColor: 'white',
      border: '2px solid #bdc3c7',
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
    totalAmount: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: 'fffff'
    },
    dateInfo: {
      backgroundColor: '#ecf0f1',
      padding: '12px 25px',
      fontSize: '14px',
      color: '#2c3e50',
      fontWeight: 'bold',
      borderBottom: '1px solid #bdc3c7'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      margin: '0'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa'
    },
    th: {
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
    thRight: {
      textAlign: 'right'
    },
    td: {
      padding: '12px',
      borderRight: '1px solid #dee2e6',
      borderBottom: '1px solid #dee2e6',
      fontSize: '15px'
    },
    tdRight: {
      textAlign: 'right',
      fontWeight: 'bold'
    },
    buttonContainer: {
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
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quotation Management</h1>
      </div>

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
          <div style={styles.dropdown}>
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
            <div style={styles.totalAmount}>Total: ₹{q.total?.toFixed(2)}</div>
          </div>
          
          <div style={styles.dateInfo}>
            Created: {q.createdAt?.toDate?.().toLocaleString() || 'No date available'}
          </div>

          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Item Description</th>
                <th style={{...styles.th, ...styles.thRight}}>Rate (₹)</th>
                <th style={{...styles.th, ...styles.thRight}}>Quantity</th>
                <th style={{...styles.th, ...styles.thRight, borderRight: 'none'}}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {q.items?.map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{item.item}</td>
                  <td style={{...styles.td, ...styles.tdRight}}>
                    {item.rate?.toFixed(2)}
                  </td>
                  <td style={{...styles.td, ...styles.tdRight}}>
                    {item.qty}
                  </td>
                  <td style={{...styles.td, ...styles.tdRight, borderRight: 'none'}}>
                    {item.amount?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={styles.buttonContainer}>
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
    </div>
  );
}

export default QuotationList;