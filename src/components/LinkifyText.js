import React from 'react';

/**
 * LinkifyText Component
 *
 * Safely converts URLs in text into clickable links that open in new tabs.
 *
 * @param {string} text - The text containing URLs to linkify
 * @param {string} className - Optional CSS class name for the container
 * @returns {React.Component} - React component with linkified text
 */
const LinkifyText = ({ text, className }) => {
  // Function to safely linkify text
  const safeLinkify = (text) => {
    if (!text) return '';

    // First escape any HTML in the text to prevent XSS
    const escapeHtml = (str) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Escape the HTML first
    const escaped = escapeHtml(text);

    // Then linkify just the URLs
    // This regex matches http/https URLs and www. URLs
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

    // Replace URLs with anchor tags
    return escaped.replace(urlRegex, function (url) {
      // If URL starts with www, prepend https://
      const href = url.startsWith('www') ? 'https://' + url : url;
      // Create anchor tag that opens in new tab
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="note-link">${url}</a>`;
    });
  };

  return (
    <div
      className={className || ''}
      dangerouslySetInnerHTML={{ __html: safeLinkify(text) }}
    />
  );
};

export default LinkifyText;
