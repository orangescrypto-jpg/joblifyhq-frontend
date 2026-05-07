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
    isRemote: jobData.isRemote || false,
    status: 'active'
  });
  return docRef.id;
};

// Fetch ALL jobs from Firestore ordered by date — filtering is done in JS
// This avoids needing composite Firestore indexes
export const getJobs = async (filters = {}, pageLimit = 20, lastDoc = null) => {
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  let jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (filters.type) {
    jobs = jobs.filter(j => j.type === filters.type);
  }
  if (filters.country) {
    jobs = jobs.filter(j =>
      (j.country || '').toLowerCase() === filters.country.toLowerCase() ||
      (j.location || '').toLowerCase().includes(filters.country.toLowerCase())
    );
  }
  if (filters.category) {
    jobs = jobs.filter(j => j.category === filters.category);
  }
  if (filters.isRemote) {
    jobs = jobs.filter(j => j.isRemote === true || j.type === 'Remote');
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    jobs = jobs.filter(j =>
      (j.title || '').toLowerCase().includes(s) ||
      (j.company || '').toLowerCase().includes(s) ||
      (j.description || '').toLowerCase().includes(s)
    );
  }

  return {
    jobs,
    lastDoc: null,
    hasMore: false
  };
};

export const getJobById = async (id) => {
  const docRef = doc(db, 'jobs', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
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
  await updateDoc(jobRef, { ...updates, updatedAt: Timestamp.now() });
};

export const deleteJob = async (id, userId) => {
  await deleteDoc(doc(db, 'jobs', id));
};

export const getEmployerJobs = async (userId) => {
  const q = query(collection(db, 'jobs'), where('postedBy', '==', userId));
  const snapshot = await getDocs(q);
  const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return jobs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const boostJob = async (id, userId, durationDays = 14) => {
  const jobRef = doc(db, 'jobs', id);
  const jobSnap = await getDoc(jobRef);
  if (!jobSnap.exists()) throw new Error('Job not found');
  await updateDoc(jobRef, {
    isFeatured: true,
    featuredUntil: Timestamp.fromMillis(Date.now() + durationDays * 24 * 60 * 60 * 1000),
    updatedAt: Timestamp.now()
  });
};

export const createReferral = async (jobId, referrerId, friendEmail) => {
  const docRef = await addDoc(collection(db, 'referrals'), {
    jobId, referrerId, friendEmail,
    createdAt: Timestamp.now(),
    status: 'pending'
  });
  return docRef.id;
};

export const getReferralCount = async (userId) => {
  const q = query(collection(db, 'referrals'), where('referrerId', '==', userId));
  const snap = await getDocs(q);
  return snap.size;
};

// ── PREMIUM BOOST SORT ──────────────────────────────────────────────────────
// Sorts a raw applications array so premium applicants always appear first.
// Within each tier group, most recent application comes first.
// Call this after fetching applications from Firestore instead of the plain
// date sort. No extra Firestore index needed — sort happens in JS.
const TIER_RANK = { 'premium-annual': 0, 'premium': 1, 'free': 2, undefined: 3 };

export const sortApplicationsByBoost = (applications) => {
  return [...applications].sort((a, b) => {
    const tierDiff = (TIER_RANK[a.applicantTier] ?? 3) - (TIER_RANK[b.applicantTier] ?? 3);
    if (tierDiff !== 0) return tierDiff;
    // Same tier — sort by most recent
    return (b.appliedAt?.seconds || 0) - (a.appliedAt?.seconds || 0);
  });
};
