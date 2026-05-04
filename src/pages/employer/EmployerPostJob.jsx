// Add these imports at top:
import { createJob } from '../../services/firebase/jobs';
import { createScholarship } from '../../services/firebase/scholarships';
import { useAuth } from '../../context/AuthContext';

// Inside the component, get user:
const { user } = useAuth();

// Update handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    if (listingType === 'job') {
      await createJob({
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        category: form.category,
        salary: form.salary,
        deadline: form.deadline,
        description: form.description,
        postedByName: user?.company || user?.name
      }, user.uid);
    } else {
      await createScholarship({
        title: form.title,
        org: form.org,
        country: form.country,
        funding: form.funding,
        category: form.category,
        benefits: form.benefits,
        deadline: form.deadline,
        description: form.description,
        postedByName: user?.company || user?.name
      }, user.uid);
    }
    
    // Show success and redirect
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate('/employer/listings');
    }, 2000);
  } catch (error) {
    console.error('Failed to create listing:', error);
    alert('Failed to publish. Please try again.');
  } finally {
    setSubmitting(false);
  }
};
