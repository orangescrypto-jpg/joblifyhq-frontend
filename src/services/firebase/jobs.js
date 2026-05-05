import { 
  collection, addDoc, getDocs, getDoc, doc, 
  updateDoc, deleteDoc, query, where, orderBy, 
  limit, startAfter, Timestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';

export const createJob = async (jobData, userId) => {
  const docRef = await addDoc(collection(db, 'jobs'), {
    ...jobData,
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

export const getJobs = async (filters = {}, pageLimit = 20, lastDoc = null) => {
  let q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));

  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters.location) {
    q = query(q, where('location', '==', filters.location));
  }
  if (filters.type) {
    q = query(q, where('type', '==', filters.type));
  }
  if (filters.search) {
    q = query(q, where('title', '>=', filters.search), where('title', '<=', filters.search + '\uf8ff'));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc), limit(pageLimit));
  } else {
    q = query(q, limit(pageLimit));
  }

  const snapshot = await getDocs(q);
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return {
    jobs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: lastVisible || null,
    hasMore: snapshot.docs.length === pageLimit
  };
};

export const getJobById = async (id) => {
  const docRef = doc(db, 'jobs', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Increment view count silently — don't block on failure (guests can't write)
    updateDoc(docRef, {
      views: (docSnap.data().views || 0) + 1,
      updatedAt: Timestamp.now()
    }).catch(() => {});
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateJob = async (id, updates, userId) => {
  const jobRef = doc(db, 'jobs', id);
  await updateDoc(jobRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteJob = async (id, userId) => {
  await deleteDoc(doc(db, 'jobs', id));
};

export const getEmployerJobs = async (userId) => {
  const q = query(
    collection(db, 'jobs'),
    where('postedBy', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const boostJob = async (id, userId, durationDays = 14) => {
  const jobRef = doc(db, 'jobs', id);
  const jobSnap = await getDoc(jobRef);

  if (jobSnap.data().postedBy !== userId) {
    throw new Error('Unauthorized');
  }

  await updateDoc(jobRef, {
    isFeatured: true,
    featuredUntil: Timestamp.fromMillis(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    updatedAt: Timestamp.now()
  });
};
