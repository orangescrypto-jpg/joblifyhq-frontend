import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

export default function AdminFormModal({ isOpen, onClose, type, initialData, onSubmit }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ ...form, id: initialData?.id, type });
    } finally {
      setLoading(false);
    }
  };

  const fields = {
    job: [
      { key: 'title', label: 'Job Title', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'location', label: 'Location', type: 'text', required: true },
      { key: 'type', label: 'Job Type', type: 'select', options: ['Full-time', 'Part-time', 'Remote', 'Contract'], required: true },
      { key: 'salary', label: 'Salary', type: 'text', required: false },
      { key: 'deadline', label: 'Deadline', type: 'date', required: true },
      { key: 'applyLink', label: 'Apply Link (URL)', type: 'url', required: false },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
    scholarship: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'org', label: 'Organization', type: 'text', required: true },
      { key: 'country', label: 'Country', type: 'text', required: true },
      { key: 'type', label: 'Funding Type', type: 'select', options: ['Full Funding', 'Partial Funding', 'Grant'], required: true },
      { key: 'deadline', label: 'Deadline', type: 'date', required: true },
      { key: 'benefits', label: 'Benefits (e.g. Tuition + Stipend)', type: 'text', required: false },
      { key: 'applyLink', label: 'Apply Link (URL)', type: 'url', required: false },
      { key: 'description', label: 'Description', type: 'textarea', required: true },
    ],
    blog: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'author', label: 'Author', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true },
      { key: 'image', label: 'Featured Image URL', type: 'url', required: false },
      { key: 'excerpt', label: 'Short Excerpt', type: 'textarea', required: true },
      { key: 'content', label: 'Content (HTML supported)', type: 'textarea', rows: 12, required: true },
    ]
  };

  const currentFields = fields[type] || [];

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {f.label}
                {!f.required && <span className="text-gray-400 text-xs ml-1">(optional)</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  value={form[f.key] || ''}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required={f.required}
                >
                  <option value="">Select...</option>
                  {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <div>
                  {type === 'blog' && f.key === 'content' && (
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition"
                      >
                        {previewMode ? 'Edit HTML' : 'Preview'}
                      </button>
                    </div>
                  )}
                  {previewMode && type === 'blog' && f.key === 'content' ? (
                    <div
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 min-h-[200px] prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: form[f.key] || '<p class="text-gray-400 italic">Preview will appear here...</p>' }}
                    />
                  ) : (
                    <textarea
                      value={form[f.key] || ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      rows={f.rows || 4}
                      className="input-field font-mono text-sm resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      placeholder={type === 'blog' && f.key === 'content' ? '<p>Write HTML content here...</p>' : ''}
                      required={f.required}
                    />
                  )}
                </div>
              ) : (
                <input
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder={f.key === 'applyLink' ? 'https://example.com/apply' : ''}
                  required={f.required}
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
