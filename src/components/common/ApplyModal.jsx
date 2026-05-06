import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSend, FiUser, FiFileText, FiCheck, FiUpload, FiPaperclip } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';

export default function ApplyModal({ isOpen, onClose, opportunity, type = 'job' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ coverNote: '', phone: '' });
  const [cvFile, setCvFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
            <FiUser size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to Apply</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">You need an account to apply directly on JoblifyHQ.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
            <FiCheck size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Application Sent! 🎉</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-1 text-sm">Your application for</p>
          <p className="font-semibold text-gray-900 dark:text-white mb-4">"{opportunity?.title}"</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">has been submitted. You can track it in your dashboard.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="btn-secondary">Close</button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">View Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setError('Only PDF or Word documents are allowed for CV.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('CV file must be under 5MB.');
      return;
    }
    setError('');
    setCvFile(file);
  };

  const uploadCV = (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `cvs/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (err) => reject(err),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Check if already applied
      const existingQ = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        where('opportunityId', '==', opportunity.id)
      );
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        setAlreadyApplied(true);
        setSubmitting(false);
        return;
      }

      // Upload CV if provided
      let cvUrl = '';
      let cvFileName = '';
      if (cvFile) {
        cvUrl = await uploadCV(cvFile);
        cvFileName = cvFile.name;
      }

      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        phone: form.phone || '',
        coverNote: form.coverNote || '',
        cvUrl,
        cvFileName,
        opportunityId: opportunity.id,
        opportunityType: type,
        title: opportunity.title,
        company: opportunity.company || opportunity.org || '',
        postedBy: opportunity.postedBy || '',
        status: 'pending',
        appliedAt: Timestamp.now(),
      });

      setSuccess(true);
    } catch (err) {
      console.error('Apply error:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (alreadyApplied) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600 text-2xl">
            ⚡
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Already Applied</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">You've already submitted an application for this opportunity.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={onClose} className="btn-secondary">Close</button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">View My Applications</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Apply for this {type === 'job' ? 'Job' : 'Scholarship'}</h3>
            <p className="text-sm text-primary-600 font-medium mt-0.5">{opportunity?.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{opportunity?.company || opportunity?.org}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Pre-filled info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Details</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* CV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload CV / Resume <span className="text-gray-400 font-normal">(optional but recommended)</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition text-center"
            >
              {cvFile ? (
                <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
                  <FiPaperclip size={16} />
                  <span className="text-sm font-medium truncate max-w-xs">{cvFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCvFile(null); fileInputRef.current.value = ''; }}
                    className="ml-1 text-red-400 hover:text-red-600"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <FiUpload size={20} />
                  <span className="text-xs">Click to upload PDF or Word document (max 5MB)</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleCvChange}
              className="hidden"
            />
            {submitting && cvFile && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Uploading CV...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cover Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Note <span className="text-gray-400 font-normal">(optional but recommended)</span>
            </label>
            <textarea
              value={form.coverNote}
              onChange={e => setForm(p => ({ ...p, coverNote: e.target.value }))}
              rows={5}
              placeholder={type === 'job'
                ? "Briefly introduce yourself and explain why you're a great fit for this role..."
                : "Tell the organization why you deserve this scholarship and how it will impact your goals..."
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{form.coverNote.length}/500 characters</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {cvFile && uploadProgress < 100 ? `Uploading ${uploadProgress}%...` : 'Submitting...'}
                </>
              ) : (
                <><FiSend size={16} /> Submit Application</>
              )}
            </button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Your profile info will be shared with the {type === 'job' ? 'employer' : 'organization'}.
          </p>
        </form>
      </div>
    </div>
  );
}
