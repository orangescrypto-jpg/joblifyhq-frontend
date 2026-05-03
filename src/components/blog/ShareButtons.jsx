import { useState } from 'react';
import { FiLink, FiTwitter, FiLinkedin, FiFacebook, FiCheck } from 'react-icons/fi';

export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  };

  const IconBtn = ({ href, icon, label }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" 
       className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
       aria-label={label}>
      {icon}
    </a>
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-500 mr-1">Share:</span>
      <IconBtn href={shareUrls.twitter} icon={<FiTwitter />} label="Share on Twitter" />
      <IconBtn href={shareUrls.linkedin} icon={<FiLinkedin />} label="Share on LinkedIn" />
      <IconBtn href={shareUrls.facebook} icon={<FiFacebook />} label="Share on Facebook" />
      <button onClick={handleCopy} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300">
        {copied ? <FiCheck className="text-green-500" /> : <FiLink />}
      </button>
    </div>
  );
}
