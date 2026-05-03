import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [applications, setApplications] = useState([]);

  // Load from localStorage when user changes
  useEffect(() => {
    if (user?.id) {
      setSavedJobs(JSON.parse(localStorage.getItem(`saved_jobs_${user.id}`)) || []);
      setSavedScholarships(JSON.parse(localStorage.getItem(`saved_scholarships_${user.id}`)) || []);
      setApplications(JSON.parse(localStorage.getItem(`applications_${user.id}`)) || []);
    }
  }, [user]);

  // Persist to localStorage when state changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`saved_jobs_${user.id}`, JSON.stringify(savedJobs));
      localStorage.setItem(`saved_scholarships_${user.id}`, JSON.stringify(savedScholarships));
      localStorage.setItem(`applications_${user.id}`, JSON.stringify(applications));
    }
  }, [savedJobs, savedScholarships, applications, user]);

  const toggleSaveJob = (job) => {
    if (!user) return;
    setSavedJobs(prev => prev.some(j => j.id === job.id) ? prev.filter(j => j.id !== job.id) : [...prev, job]);
  };

  const toggleSaveScholarship = (sch) => {
    if (!user) return;
    setSavedScholarships(prev => prev.some(s => s.id === sch.id) ? prev.filter(s => s.id !== sch.id) : [...prev, sch]);
  };

  const submitApplication = ({ type, opportunityId, title, org, cvName, coverLetter }) => {
    if (!user) return;
    const newApp = { id: `app_${Date.now()}`, type, opportunityId, title, org, cvName, coverLetter, appliedAt: new Date().toISOString(), status: 'Submitted' };
    setApplications(prev => [newApp, ...prev]);
  };

  return (
    <DashboardContext.Provider value={{ 
      savedJobs, savedScholarships, applications, 
      toggleSaveJob, toggleSaveScholarship, submitApplication 
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
