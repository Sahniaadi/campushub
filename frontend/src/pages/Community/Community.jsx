import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Users, Plus, Heart, MessageCircle, Trash2, X, Send, Filter, Search, TrendingUp } from 'lucide-react';

const CATEGORIES = ['general','doubt','resource','news','placement'];
const CAT_COLORS = { general:'badge-blue', doubt:'badge-yellow', resource:'badge-green', news:'badge-purple', placement:'badge-red' };
const CAT_ICONS  = { general:'🗣️', doubt:'❓', resource:'📚', news:'📰', placement:'💼' };

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'general', tags: '' });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (catFilter) params.append('category', catFilter);
      if (search)    params.append('search', search);
      const { data } = await API.get(`/community/posts?${params}`);
      setPosts(data.data || []);
    } catch { toast.error('Failed to load community posts.'); }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [catFilter, search]); // eslint-disable-line

  const createPost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Title and content required.');
    try {
      const { data } = await API.post('/community/posts', { ...form, tags: form.tags });
      setPosts((prev) => [data.data, ...prev]);
      setShowCreate(false);
      setForm({ title: '', content: '', category: 'general', tags: '' });
      toast.success('Post created!');
    } catch { toast.error('Post failed.'); }
  };

  const toggleLike = async (postId) => {
    try {
      const { data } = await API.put(`/community/posts/${postId}/like`);
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, likes: data.liked ? [...p.likes, user._id] : p.likes.filter((id) => id !== user._id) } : p));
    } catch {}
  };

  const submitComment = async (postId) => {
    if (!comments.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/community/posts/${postId}/comment`, { text: comments });
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, comments: data.data } : p));
      setComments('');
      toast.success('Comment added!');
    } catch { toast.error('Comment failed.'); }
    setSubmitting(false);
  };

  const deletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await API.delete(`/community/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Post deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><Users size={24} className="text-blue-500" /> Community</h1>
          <p className="page-subtitle">Ask questions, share resources, and connect with peers</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Post</button>
      </div>

      {/* Search + Category filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search discussions…" className="input pl-10 py-2.5" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter('')} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${!catFilter ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>All</button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCatFilter(c === catFilter ? '' : c)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all
                ${catFilter === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No posts yet</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 mx-auto inline-flex gap-2"><Plus size={16} />Start a Discussion</button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = post.likes?.includes(user?._id);
            const isExpanded = expanded === post._id;
            return (
              <div key={post._id} className="card hover:shadow-md transition-all duration-200">
                {/* Post header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {post.author?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{post.author?.name}</span>
                      {post.author?.branch && <span className="text-xs text-gray-400">• {post.author.branch}</span>}
                      <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                      <span className={CAT_COLORS[post.category] || 'badge-blue'}>{CAT_ICONS[post.category]} {post.category}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-1">{post.title}</h3>
                  </div>
                  {post.author?._id === user?._id && (
                    <button onClick={() => deletePost(post._id)} className="btn-ghost p-2 text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={14} /></button>
                  )}
                </div>

                <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${!isExpanded && 'line-clamp-3'}`}>{post.content}</p>
                {post.content.length > 200 && (
                  <button onClick={() => setExpanded(isExpanded ? null : post._id)} className="text-indigo-600 text-xs font-medium mt-1 hover:underline">
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}

                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => toggleLike(post._id)} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                    <Heart size={16} className={isLiked ? 'fill-current' : ''} /> {post.likes?.length || 0}
                  </button>
                  <button onClick={() => setExpanded(isExpanded ? null : post._id)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-500 transition-colors">
                    <MessageCircle size={16} /> {post.comments?.length || 0} Comments
                  </button>
                </div>

                {/* Comments section */}
                {isExpanded && (
                  <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="divider" />
                    {post.comments?.length > 0 && (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto">
                        {post.comments.map((c) => (
                          <div key={c._id} className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {c.user?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.user?.name}</span>
                                <span className="text-[10px] text-gray-400">{timeAgo(c.createdAt)}</span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment input */}
                    <div className="flex gap-2">
                      <input value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Write a comment…" className="input flex-1 py-2 text-sm" onKeyDown={(e) => e.key === 'Enter' && submitComment(post._id)} />
                      <button onClick={() => submitComment(post._id)} disabled={submitting || !comments.trim()} className="btn-primary px-3 py-2">
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Create Post</h2>
              <button onClick={() => setShowCreate(false)} className="btn-ghost p-2"><X size={18} /></button>
            </div>
            <form onSubmit={createPost} className="p-6 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="What's on your mind?" className="input" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Content *</label>
                <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} placeholder="Describe your question, share resources, or start a discussion…" className="input resize-none" rows={5} />
              </div>
              <div>
                <label className="label">Tags (comma separated)</label>
                <input value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="e.g. exam, placements, help" className="input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Post 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
