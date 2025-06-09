import React, { useEffect, useState } from "react";
import { db } from "./components/firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";

const QuotationForm = () => {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([]);
  const [itemMaster, setItemMaster] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      const snapshot = await getDocs(collection(db, "items"));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItemMaster(list);
    };
    fetchItems();
  }, []);

  const addItem = () => {
    setItems([...items, { name: "", rate: 0, qty: 0, amount: 0 }]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === "name") {
      updated[index].name = value;
      const selected = itemMaster.find(item => item.name === value);
      updated[index].rate = selected?.rate || 0;
    } else if (field === "qty") {
      updated[index].qty = parseFloat(value) || 0;
    }

    updated[index].amount = (updated[index].rate || 0) * (updated[index].qty || 0);
    setItems(updated);
    setTotal(updated.reduce((sum, item) => sum + item.amount, 0));
  };

  const handleSubmit = async () => {
    try {
      const docRef = await addDoc(collection(db, "quotations"), {
        customerName,
        items,
        total,
        createdAt: Timestamp.now()
      });
      alert("Quotation saved to Firebase!");
      setCustomerName("");
      setItems([]);
      setTotal(0);
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save quotation.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create Quotation</h2>

      <input
        className="border p-2 mb-4 w-full"
        placeholder="Customer Name"
        value={customerName}
        onChange={e => setCustomerName(e.target.value)}
      />

      {items.map((item, i) => (
        <div className="flex gap-2 mb-2" key={i}>
          <select
            className="border p-2 w-1/3"
            value={item.name}
            onChange={e => handleItemChange(i, "name", e.target.value)}
          >
            <option value="">Select Item</option>
            {itemMaster.map(itm => (
              <option key={itm.id} value={itm.name}>
                {itm.name} — ₹{itm.rate}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Qty"
            className="border p-2 w-1/5"
            value={item.qty}
            onChange={e => handleItemChange(i, "qty", e.target.value)}
          />

          <input
            type="number"
            className="border p-2 w-1/5"
            value={item.rate}
            disabled
          />

          <input
            type="number"
            className="border p-2 w-1/5"
            value={item.amount}
            disabled
          />
        </div>
      ))}

      <button
        onClick={addItem}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        + Add Item
      </button>

      <div className="font-semibold text-lg mb-4">Total: ₹{total}</div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2 rounded"
      >
        Save Quotation
      </button>
    </div>
  );
};

export default QuotationForm;
