// src/pages/Dashboard.tsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import MenuBar from '../components/MenuBar';
import { useAuth } from '../components/useAuth';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || '';

type UserSummary = { name: string; avatarUrl?: string };
type Comment = { id: string; author: UserSummary; content: string; createdAt: string };
type Post = { 
  id: string; 
  author: UserSummary; 
  content: string; 
  imageUrl?: string; 
  createdAt: string; 
  likes: number; 
  likedByMe?: boolean; 
  comments?: Comment[]; 
};

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchPosts(page); }, [page]);

  const fetchPosts = async (pageNum: number) => {
    setLoading(true);
    try {
      if (API_URL) {
        const res = await axios.get<Post[]>(`${API_URL}/posts?page=${pageNum}`, { withCredentials: true });
        setPosts((prev) => [...prev, ...res.data]);
      } else {
        setPosts((prev) => [...prev, ...getMockPosts()]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleShare = async () => {
    if (!newPostText.trim() || !user) return;
    const formData = new FormData();
    formData.append('content', newPostText);
    if (newPostImage) formData.append('image', newPostImage);

    const newPost: Post = {
      id: String(Date.now()),
      author: { name: user.name, avatarUrl: user.avatarUrl },
      content: newPostText,
      imageUrl: newPostImage ? URL.createObjectURL(newPostImage) : undefined,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setNewPostText('');
    setNewPostImage(null);

    try { if (API_URL) await axios.post(`${API_URL}/posts`, formData, { withCredentials: true }); } 
    catch (err) { console.error(err); }
  };

  const toggleLike = async (postId: string) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes -1 : p.likes +1 } : p));
    try { if (API_URL) await axios.post(`${API_URL}/posts/${postId}/like`, null, { withCredentials: true }); } 
    catch (err) { console.error(err); }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !commentText[postId]?.trim()) return;
    const newComment: Comment = { id: String(Date.now()), author: { name: user.name, avatarUrl: user.avatarUrl }, content: commentText[postId], createdAt: new Date().toISOString() };
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: [...(p.comments||[]), newComment] } : p));
    setCommentText((prev) => ({ ...prev, [postId]: '' }));

    try { if (API_URL) await axios.post(`${API_URL}/posts/${postId}/comments`, { content: newComment.content }, { withCredentials: true }); } 
    catch (err) { console.error(err); }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        setPage((p) => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (authLoading) return <div>Loading user...</div>;

  return (
    <>
      <MenuBar />
      <div className="dashboard-page" ref={containerRef}>
        <div className="container">
          {/* New post */}
          <div className="panel new-post">
            <div className="new-post-header">
              <img className="avatar" src={user?.avatarUrl || 'https://i.pravatar.cc/150'} />
              <textarea placeholder="What's on your mind?" value={newPostText} onChange={(e) => setNewPostText(e.target.value)} />
            </div>
            <div className="new-post-actions">
              <input type="file" onChange={(e) => setNewPostImage(e.target.files?.[0] || null)} />
              <button className="btn-share" onClick={handleShare}>Share</button>
            </div>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <div key={post.id} className="panel post">
              <div className="media-block">
                <img className="avatar" src={post.author.avatarUrl || 'https://i.pravatar.cc/150'} />
                <div className="media-body">
                  <div className="header">
                    <strong>{post.author.name}</strong> • <small>{formatRelative(post.createdAt)}</small>
                  </div>
                  <p>{post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} className="post-image" />}

                  <div className="actions">
                    <button onClick={() => toggleLike(post.id)}>{post.likedByMe ? '💙' : '🤍'} {post.likes}</button>
                  </div>

                  {/* Comments */}
                  <div className="comments">
                    {post.comments?.map((c) => (
                      <div key={c.id} className="comment">
                        <img className="avatar-sm" src={c.author.avatarUrl || 'https://i.pravatar.cc/150'} />
                        <div>
                          <strong>{c.author.name}</strong>: {c.content} • {formatRelative(c.createdAt)}
                        </div>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText[post.id] || ''}
                      onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    />
                    <button onClick={() => handleAddComment(post.id)}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {loading && <div>Loading more posts...</div>}
        </div>
      </div>
    </>
  );
};

export default Dashboard;

// Helpers
function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + ' min ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + ' hour' + (hrs > 1 ? 's' : '') + ' ago';
  const days = Math.floor(hrs / 24);
  return days + ' day' + (days > 1 ? 's' : '') + ' ago';
}

// Mock posts
function getMockPosts(): Post[] {
  return [
    {
      id: 'p1',
      author: { name: 'Lisa D.', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar1.png' },
      content: 'Lorem ipsum dolor sit amet, consectetur ',
      createdAt: new Date(Date.now() - 11 * 60000).toISOString(),
      likes: 12,
      likedByMe: false,
      comments: [
        { id: 'c1', author: { name: 'Bobby M.', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar2.png' }, content: 'Nice post!', createdAt: new Date(Date.now() - 7 * 60000).toISOString() },
        { id: 'c2', author: { name: 'Lucy M.', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar3.png' }, content: 'Agree!', createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
      ],
    },
  ];
}
