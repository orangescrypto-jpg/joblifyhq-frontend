// In Admin.jsx, make sure you have:
import { getBlogs, createBlog, updateBlog, deleteBlog } from '../services/firebase/blog';

// In the fields object for AdminFormModal:
blog: [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'author', label: 'Author', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'image', label: 'Featured Image URL', type: 'url' },
  { key: 'excerpt', label: 'Short Excerpt', type: 'textarea' },
  { key: 'content', label: 'Content (HTML supported)', type: 'textarea', rows: 12 },
]

// In handleSave function:
const handleSave = async (item) => {
  try {
    if (item.type === 'blog') {
      if (item.id && !item.id.startsWith('new_')) {
        // Update existing
        await updateBlog(item.id, item, user.uid);
      } else {
        // Create new
        const newId = await createBlog(item, user.uid);
        item.id = newId;
      }
    }
    // ... handle jobs and scholarships similarly
    
    // Update local state
    setData(prev => {
      const arr = prev[item.type] || [];
      const exists = arr.find(i => i.id === item.id);
      return {
        ...prev,
        [item.type]: exists ? arr.map(i => i.id === item.id ? item : i) : [...arr, item]
      };
    });
  } catch (error) {
    console.error('Error saving:', error);
    alert('Failed to save. Please try again.');
  }
};
