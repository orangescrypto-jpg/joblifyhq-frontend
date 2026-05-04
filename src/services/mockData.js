export const fetchBlogs = async () => {
  await delay(800);
  return [
    { 
      id: 'b1', 
      title: 'How to Ace Technical Interviews in 2026', 
      excerpt: 'Master the STAR method, practice system design, and learn what hiring managers actually look for.', 
      content: `
        <p>Master the STAR method, practice system design, and learn what hiring managers actually look for.</p>
        
        <h3>1. Understand the Interview Structure</h3>
        <p>Technical interviews typically include coding challenges, system design questions, and behavioral assessments.</p>
        
        <h3>2. Practice Coding Daily</h3>
        <ul>
          <li>Solve problems on LeetCode, HackerRank</li>
          <li>Focus on data structures and algorithms</li>
          <li>Practice explaining your thought process</li>
        </ul>
        
        <h3>3. Master System Design</h3>
        <p>Learn to design scalable systems by studying real-world architectures.</p>
      `,
      author: 'Sarah Chen', 
      date: 'May 1, 2026', 
      category: 'Career Tips', 
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80' 
    },
    // Add more posts here...
  ];
};
