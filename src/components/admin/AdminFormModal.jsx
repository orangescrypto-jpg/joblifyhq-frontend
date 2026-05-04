import { useState, useEffect, lazy, Suspense } from 'react';
import { FiX } from 'react-icons/fi';
import 'react-quill/dist/quill.snow.css';

// Lazy load ReactQuill for better bundle splitting (Vite-compatible)
const ReactQuill = lazy(() => import('react-quill'));

export default function AdminFormModal({ isOpen, onClose, type, initialData, onSubmit }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [editorMode, setEditorMode] = useState('rich'); // 'rich' or 'html'
  const [quillLoaded, setQuillLoaded] = useState(false);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({});
  }, [initialData, isOpen]);

  // Load Quill only when modal opens and editor is needed
  useEffect(() => {
    if (isOpen && type === 'blog' && !quillLoaded) {
      import('react-quill').then(() => setQuillLoaded(true));
    }
  }, [isOpen, type, quillLoaded]);

  if (!isOpen) return null;

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(res => setTimeout(res, 800)); // Mock API delay
    onSubmit({ ...form, id: initialData?.id || `new_${Date.now()}`, type });
    setLoading(false);
    onClose();
  };

  const fields = {
    job: [
      { key: 'title', label: 'Job Title', type: 'text' },
      { key: 'company', label: 'Company', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'type', label: 'Job Type', type: 'select', options: ['Full-time', 'Part-time', 'Remote', 'Contract'] },
      { key: 'salary', label: 'Salary', type: 'text' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    scholarship: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'org', label: 'Organization', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'type', label: 'Funding Type', type: 'select', options: ['Full Funding', 'Partial Funding', 'Grant'] },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
    blog: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'author', label: 'Author', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'image', label: 'Featured Image URL', type: 'url' },
      { key: 'excerpt', label: 'Short Excerpt', type: 'textarea' },
    ]
  };

  const currentFields = fields[type] || [];

  // Rich text editor toolbar configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="text-lg font-semibold capitalize dark:text-white">{initialData ? 'Edit' : 'Create'} {type}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {currentFields.map(f => (
            <div key={f.key} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key] || ''} onChange={(e) => handleChange(f.key, e.target.value)} className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white" required>
                  <option value="">Select...</option>
                  {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : type === 'blog' && f.key === 'content' ? (
                // Rich Text Editor for Blog Content
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => setEditorMode('rich')}
                      className={`px-4 py-2 text-sm font-medium ${editorMode === 'rich' ? 'bg-white dark:bg-gray-700 text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      Rich Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('html')}
                      className={`px-4 py-2 text-sm font-medium ${editorMode === 'html' ? 'bg-white dark:bg-gray-700 text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      HTML
                    </button>
                  </div>
                  {editorMode === 'rich' ? (
                    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading editor...</div>}>
                      {quillLoaded ? (
                        <ReactQuill 
                          theme="snow"
                          value={form[f.key] || ''}
                          onChange={(content) => handleChange(f.key, content)}
                          modules={quillModules}
                          className="bg-white dark:bg-gray-800"
                          style={{ height: '300px' }}
                        />
                      ) : (
                        <div className="p-8 text-center text-gray-500">Loading editor...</div>
                      )}
                    </Suspense>
                  ) : (
                    <textarea
                      value={form[f.key] || ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      rows={12}
                      className="input-field font-mono text-sm resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder="<p>Write your HTML content here...</p>"
                      required
                    />
                  )}
                </div>
              ) : f.type === 'textarea' ? (
                <textarea value={form[f.key] || ''} onChange={(e) => handleChange(f.key, e.target.value)} rows={f.rows || 4} className="input-field resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
              ) : (
                <input type={f.type} value={form[f.key] || ''} onChange={(e) => handleChange(f.key, e.target.value)} className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
