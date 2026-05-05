import { 
  collection, addDoc, getDocs, getDoc, doc, 
  updateDoc, deleteDoc, query, where, orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export const createScholarship = async (data, userId) => {
  const docRef = await addDoc(collection(db, 'scholarships'), {
    ...data,
    postedBy: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    applications: 0,
    views: 0,
    isFeatured: false,
    status: 'active'
  });
  return docRef.id;
};

export const getScholarships = async (filters = {}) => {
  let q = query(collection(db, 'scholarships'), orderBy('createdAt', 'desc'));

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters.country) {
    q = query(q, where('country', '==', filters.country));
  }
  if (filters.funding) {
    q = query(q, where('funding', '==', filters.funding));
  }
  if (filters.search) {
    q = query(q, where('title', '>=', filters.search), where('title', '<=', filters.search + '\uf8ff'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getScholarshipById = async (id) => {
  const docRef = doc(db, 'scholarships', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await updateDoc(docRef, {
      views: (docSnap.data().views || 0) + 1,
      updatedAt: Timestamp.now()
    });
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

// FIXED: admin can edit any scholarship — removed strict ownership check
export const updateScholarship = async (id, updates, userId) => {
  const schRef = doc(db, 'scholarships', id);
  await updateDoc(schRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

// FIXED: admin can delete any scholarship — removed strict ownership check
export const deleteScholarship = async (id, userId) => {
  await deleteDoc(doc(db, 'scholarships', id));
};

export const getEmployerScholarships = async (userId) => {
  const q = query(
    collection(db, 'scholarships'),
    where('postedBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const boostScholarship = async (id, userId, durationDays = 14) => {
  const schRef = doc(db, 'scholarships', id);
  const schSnap = await getDoc(schRef);

  if (!schSnap.exists()) throw new Error('Scholarship not found');
  if (schSnap.data().postedBy !== userId) throw new Error('Unauthorized');

  await updateDoc(schRef, {
    isFeatured: true,
    featuredUntil: Timestamp.fromMillis(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    updatedAt: Timestamp.now()
  });
};
