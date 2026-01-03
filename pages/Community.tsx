import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { ForumPost, Role } from '../types';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM;

export const Community: React.FC = () => {
  const user = StorageService.getCurrentUser();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General Discussion');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
      setPosts(await StorageService.getForumPosts());
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    await StorageService.addForumPost({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      title,
      content,
      category
    });

    loadPosts();
    setShowNewPost(false);
    setTitle('');
    setContent('');
  };

  const handleLike = async (postId: string) => {
    await StorageService.likePost(postId);
    loadPosts();
  };

  const handleReply = async (postId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const text = replyContent[postId];
    if (!text) return;

    await StorageService.replyToPost(postId, {
      userId: user.id,
      userName: user.name,
      content: text
    });

    setReplyContent({ ...replyContent, [postId]: '' });
    loadPosts();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Community Forum</h1>
          <p className="text-slate-500 mt-1">Connect with other learners and instructors.</p>
        </div>
        <button onClick={() => { if (!user) navigate('/login'); else setShowNewPost(!showNewPost); }} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium">
          {showNewPost ? 'Cancel' : '+ New Discussion'}
        </button>
      </div>

      {showNewPost && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 mb-8 animate-fade-in-down">
          <h3 className="font-bold text-lg mb-4">Start a new discussion</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input type="text" required placeholder="Discussion Title" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <select className="w-full border border-slate-300 rounded p-2 bg-white text-slate-900" value={category} onChange={e => setCategory(e.target.value)}>
                  <option>General Discussion</option><option>Course Help</option><option>Study Groups</option><option>Career Advice</option>
                </select>
              </div>
            </div>
            <textarea required placeholder="What's on your mind?" rows={4} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" value={content} onChange={e => setContent(e.target.value)}></textarea>
            <div className="flex justify-end"><button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Post Discussion</button></div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${post.userRole === Role.INSTRUCTOR ? 'bg-purple-500' : 'bg-indigo-500'}`}>{post.userName.charAt(0)}</div>
                <div>
                  <h3 className="font-bold text-slate-800">{post.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="font-medium">{post.userName}</span>
                    <span className={`px-1.5 py-0.5 rounded ${post.userRole === Role.INSTRUCTOR ? 'bg-purple-100 text-purple-700' : 'bg-slate-100'}`}>{post.userRole}</span>
                    <span>• {post.date}</span>
                    <span className="bg-slate-100 px-2 rounded-full">{post.category}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-slate-500 hover:text-red-500 transition">
                <svg className="w-5 h-5" fill={post.likes > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
            </div>
            
            <p className="text-slate-700 mb-6 whitespace-pre-line">{post.content}</p>

            {post.replies.length > 0 && (
              <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-4">
                {post.replies.map(reply => (
                  <div key={reply.id} className="text-sm">
                    <div className="flex justify-between text-slate-500 text-xs mb-1">
                      <span className="font-bold text-slate-700">{reply.userName}</span>
                      <span>{reply.date}</span>
                    </div>
                    <p className="text-slate-700">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input type="text" placeholder="Write a reply..." className="flex-grow border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white text-slate-900" value={replyContent[post.id] || ''} onChange={e => setReplyContent({ ...replyContent, [post.id]: e.target.value })} />
              <button onClick={() => handleReply(post.id)} className="text-indigo-600 font-medium text-sm hover:underline px-2">Reply</button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">No discussions yet. Be the first to start one!</div>
        )}
      </div>
    </div>
  );
};