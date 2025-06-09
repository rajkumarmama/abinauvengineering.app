import React, { useState, useEffect, useRef } from 'react';
import { db } from './components/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

function Billing() {
  const [customerName, setCustomerName] = useState('');
  const [customerMaster, setCustomerMaster] = useState([]);
  const [items, setItems] = useState([{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  const [itemMaster, setItemMaster] = useState([]);
  const printRef = useRef();

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
    const updatedItems = [...items];
    if (field === 'item') {
      const matched = itemMaster.find(i => i.name.toLowerCase() === value.toLowerCase());
      updatedItems[index] = {
        ...updatedItems[index],
        item: value,
        rate: matched?.rate || 0,
        stock: matched?.stock || 0,
        amount: (matched?.rate || 0) * updatedItems[index].qty,
      };
    } else if (field === 'qty') {
      const qty = parseInt(value) || 1;
      updatedItems[index].qty = qty;
      updatedItems[index].amount = updatedItems[index].rate * qty;
    }
    setItems(updatedItems);
  };

  const addRow = () => {
    setItems([...items, { item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  };

  const deleteRow = index => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems.length > 0 ? newItems : [{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
  };

  const total = items.reduce((sum, row) => sum + row.amount, 0);

  const handleSave = async () => {
    try {
      for (const row of items) {
        const itemDoc = itemMaster.find(i => i.name.toLowerCase() === row.item.toLowerCase());
        if (itemDoc) {
          const newStock = itemDoc.stock - row.qty;
          await updateDoc(doc(db, 'items', itemDoc.id), { stock: newStock });
        }
      }

      await addDoc(collection(db, 'bills'), {
        customerName,
        items,
        total,
        createdAt: Timestamp.now(),
      });

      alert('Bill saved and stock updated!');
      window.print();
      setCustomerName('');
      setItems([{ item: '', rate: 0, qty: 1, amount: 0, stock: 0 }]);
    } catch (err) {
      console.error(err);
      alert('Error saving bill');
    }
  };

  return (
    <div ref={printRef} style={{ padding: 24, maxWidth: 800, margin: 'auto' }}>
      <h2>Billing</h2>

      <label>Customer Name</label>
      <input
        type="text"
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
        placeholder="Start typing customer name"
        style={{ width: '100%', marginBottom: 16, padding: 8 }}
      />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {customerMaster
          .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()) && c.name.toLowerCase() !== customerName.toLowerCase())
          .slice(0, 5)
          .map(c => (
            <li key={c.id} style={{ cursor: 'pointer' }} onMouseDown={() => setCustomerName(c.name)}>
              {c.name}
            </li>
          ))}
      </ul>

      <table width="100%" border="1" cellPadding="10" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Rate</th>
            <th>Qty</th>
            <th>Stock</th>
            <th>Amount</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  value={row.item}
                  onChange={e => handleItemChange(index, 'item', e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="Item name"
                />
              </td>
              <td>{row.rate}</td>
              <td>
                <input
                  type="number"
                  value={row.qty}
                  min="1"
                  onChange={e => handleItemChange(index, 'qty', e.target.value)}
                  style={{ width: 60 }}
                />
              </td>
              <td>{row.stock}</td>
              <td>{row.amount.toFixed(2)}</td>
              <td>
                <button onClick={() => deleteRow(index)} style={{ background: 'red', color: 'white' }}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow} style={{ marginTop: 12 }}>+ Add Item</button>

      <div style={{ fontWeight: 'bold', marginTop: 20 }}>Total: ₹{total.toFixed(2)}</div>

      <button onClick={handleSave} style={{ marginTop: 20, backgroundColor: 'green', color: 'white', padding: '10px 20px', fontWeight: 600 }}>
        Save & Print
      </button>
    </div>
  );
}

export default Billing;
