// src/firebase/leadService.js
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

// Collection reference
const leadsCollection = collection(db, 'leads');
const listsCollection = collection(db, 'customLists');

// Lead Services
export const leadService = {
  // Get all leads
  getLeads: async () => {
    const snapshot = await getDocs(leadsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Add new lead
  addLead: async (lead) => {
    const docRef = await addDoc(leadsCollection, lead);
    return {
      id: docRef.id,
      ...lead,
    };
  },

  // Update lead
  updateLead: async (id, lead) => {
    const leadRef = doc(db, 'leads', id);
    await updateDoc(leadRef, lead);
    return {
      id,
      ...lead,
    };
  },

  // Delete lead
  deleteLead: async (id) => {
    const leadRef = doc(db, 'leads', id);
    await deleteDoc(leadRef);
    return id;
  },

  // Get leads by industry
  getLeadsByIndustry: async (industry) => {
    const q = query(leadsCollection, where('industry', '==', industry));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
};

// Custom List Services
export const listService = {
  // Get all custom lists
  getLists: async () => {
    const snapshot = await getDocs(listsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Add new list
  addList: async (list) => {
    const docRef = await addDoc(listsCollection, list);
    return {
      id: docRef.id,
      ...list,
    };
  },

  // Delete list
  deleteList: async (id) => {
    const listRef = doc(db, 'customLists', id);
    await deleteDoc(listRef);
    return id;
  },
};
