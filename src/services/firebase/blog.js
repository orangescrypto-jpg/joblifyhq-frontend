import { 
  collection, addDoc, getDocs, getDoc, doc, 
  updateDoc, deleteDoc, query, orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export const createBlog = async (postData, userId) => {
  const docRef = await addDoc(collection(db, 'blog'), {
    ...postData,
    authorId: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    views: 0,
    published: true
  });
  return docRef.id;
};

export const getBlogs = async (filters = {}) => {
  let q = query(collection(db, 'blog'), orderBy('createdAt', 'desc'));
  
  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBlogById = async (id) => {
  const docRef = doc(db, 'blog', id);
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

export const updateBlog = async (id, updates, userId) => {
  const blogRef = doc(db, 'blog', id);
  const blogSnap = await getDoc(blogRef);
  // Only admin or author can edit
  if (blogSnap.data().authorId !== userId) {
    throw new Error('Unauthorized');
  }
  await updateDoc(blogRef, { ...updates, updatedAt: Timestamp.now() });
};

export const deleteBlog = async (id, userId) => {
  const blogRef = doc(db, 'blog', id);
  const blogSnap = await getDoc(blogRef);
  if (blogSnap.data().authorId !== userId) {
    throw new Error('Unauthorized');
  }
  await deleteDoc(blogRef);
};
