import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  collection, addDoc, getDocs, query, where, 
  doc, updateDoc, deleteDoc, serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setSavedJobs([]);
      setSavedScholarships([]);
      setApplications([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch saved jobs
        const savedJobsSnap = await getDocs(
          query(collection(db, 'user_saves'), 
            where('userId', '==', user.uid), 
            where('type', '==', 'job'))
        );
        setSavedJobs(savedJobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch saved scholarships
        const savedSchSnap = await getDocs(
          query(collection(db, 'user_saves'), 
            where('userId', '==', user.uid), 
            where('type', '==', 'scholarship'))
        );
        setSavedScholarships(savedSchSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch applications
        const appsSnap = await getDocs(
          query(collection(db, 'applications'), 
            where('userId', '==', user.uid))
        );
        setApplications(appsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching dashboard ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const toggleSaveJob = async (job) => {
    if (!user) return;
    
    // Check if already saved
    const existing = savedJobs.find(j => j.itemData?.id === job.id || j.jobId === job.id);
    
    if (existing) {
      await deleteDoc(doc(db, 'user_saves', existing.id));
      setSavedJobs(prev => prev.filter(j => j.id !== existing.id));
    } else {
      const ref = await addDoc(collection(db, 'user_saves'), { 
        userId: user.uid, 
        type: 'job', 
        jobId: job.id,
        itemData: job,
        savedAt: serverTimestamp()
      });
      setSavedJobs(prev => [...prev, { 
        id: ref.id, 
        userId: user.uid, 
        type: 'job', 
        jobId: job.id,
        itemData: job 
      }]);
    }
  };

  const toggleSaveScholarship = async (sch) => {
    if (!user) return;
    
    const existing = savedScholarships.find(s => s.itemData?.id === sch.id || s.scholarshipId === sch.id);
    
    if (existing) {
      await deleteDoc(doc(db, 'user_saves', existing.id));
      setSavedScholarships(prev => prev.filter(s => s.id !== existing.id));
    } else {
      const ref = await addDoc(collection(db, 'user_saves'), { 
        userId: user.uid, 
        type: 'scholarship', 
        scholarshipId: sch.id,
        itemData: sch,
        savedAt: serverTimestamp()
      });
      setSavedScholarships(prev => [...prev, { 
        id: ref.id, 
        userId: user.uid, 
        type: 'scholarship', 
        scholarshipId: sch.id,
        itemData: sch 
      }]);
    }
  };

  const submitApplication = async ({ type, opportunityId, title, org, cvUrl, coverLetter }) => {
    if (!user) return;
    
    const ref = await addDoc(collection(db, 'applications'), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.name,
      type,
      opportunityId,
      title,
      org,
      cvUrl,
      coverLetter,
      status: 'Submitted',
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update applications state
    setApplications(prev => [{ 
      id: ref.id, 
      userId: user.uid, 
      type, 
      opportunityId, 
      title, 
      org, 
      cvUrl, 
      coverLetter, 
      status: 'Submitted', 
      appliedAt: new Date().toISOString() 
    }, ...prev]);
    
    return ref.id;
  };

  return (
    <DashboardContext.Provider value={{ 
      savedJobs, 
      savedScholarships, 
      applications, 
      loading,
      toggleSaveJob, 
      toggleSaveScholarship, 
      submitApplication 
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
