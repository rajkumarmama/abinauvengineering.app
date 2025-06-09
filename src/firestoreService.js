// src/firestoreService.js
import { db } from './components/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

// === Item Collection ===
const itemCollection = collection(db, "items");

export const getItems = async () => {
  const snapshot = await getDocs(itemCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addItem = async (item) => {
  await addDoc(itemCollection, item);
};

export const updateItem = async (id, item) => {
  const itemRef = doc(db, "items", id);
  await updateDoc(itemRef, item);
};

export const deleteItem = async (id) => {
  const itemRef = doc(db, "items", id);
  await deleteDoc(itemRef);
};

// === Customer Collection ===
const customerCollection = collection(db, "customers");

export const getCustomers = async () => {
  const snapshot = await getDocs(customerCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addCustomer = async (customer) => {
  await addDoc(customerCollection, customer);
};

export const updateCustomer = async (id, customer) => {
  const customerRef = doc(db, "customers", id);
  await updateDoc(customerRef, customer);
};

export const deleteCustomer = async (id) => {
  const customerRef = doc(db, "customers", id);
  await deleteDoc(customerRef);
};
