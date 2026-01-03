import React from 'react';

const RESOURCES = [
  {
    category: 'Development Tools',
    items: [
      { name: 'VS Code', desc: 'The leading code editor for web development.', url: 'https://code.visualstudio.com/' },
      { name: 'GitHub', desc: 'Version control and collaboration platform.', url: 'https://github.com/' },
      { name: 'Chrome DevTools', desc: 'Built-in browser tools for debugging.', url: 'https://developer.chrome.com/docs/devtools/' },
    ]
  },
  {
    category: 'Documentation & Guides',
    items: [
      { name: 'MDN Web Docs', desc: 'The bible of web development.', url: 'https://developer.mozilla.org/' },
      { name: 'React Docs', desc: 'Official React framework documentation.', url: 'https://react.dev/' },
      { name: 'W3Schools', desc: 'Beginner friendly web tutorials.', url: 'https://www.w3schools.com/' },
    ]
  },
  {
    category: 'Design & Assets',
    items: [
      { name: 'Figma', desc: 'Collaborative interface design tool.', url: 'https://www.figma.com/' },
      { name: 'Unsplash', desc: 'Free high-resolution stock photos.', url: 'https://unsplash.com/' },
      { name: 'FontAwesome', desc: 'Icon library for your websites.', url: 'https://fontawesome.com/' },
    ]
  },
  {
    category: 'Data Science',
    items: [
      { name: 'Kaggle', desc: 'Data sets and machine learning competitions.', url: 'https://www.kaggle.com/' },
      { name: 'Anaconda', desc: 'Data science distribution for Python.', url: 'https://www.anaconda.com/' },
      { name: 'Google Colab', desc: 'Write and execute Python in your browser.', url: 'https://colab.research.google.com/' },
    ]
  }
];

export const Resources: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Learning Resources</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Curated tools, documentation, and assets to help you succeed in your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RESOURCES.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-white font-bold text-lg">{section.category}</h2>
            </div>
            <div className="p-6 divide-y divide-slate-100">
              {section.items.map((item, i) => (
                <div key={i} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                    >
                      Visit 
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
