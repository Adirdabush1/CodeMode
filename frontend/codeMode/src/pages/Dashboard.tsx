// Dashboard.tsx
// מיקום מומלץ: src/pages/Dashboard.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MenuBar from '../components/MenuBar';
import './Dashboard.css';

// אם ברצונך לשלב נקודת קצה שונה, הגדר REACT_APP_API_URL בקובץ .env
const API_URL = process.env.REACT_APP_API_URL || '';

type UserSummary = {
  name: string;
  avatarUrl?: string;
};

type Comment = {
  id: string;
  author: UserSummary;
  content: string;
  createdAt: string;
};

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostText, setNewPostText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      if (API_URL) {
        const res = await axios.get<Post[]>(`${API_URL}/posts`, { withCredentials: true });
        setPosts(res.data);
      } else {
        // אם אין backend מוגדר - טען דמה
        setPosts(getMockPosts());
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setPosts(getMockPosts());
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: String(Date.now()),
      author: { name: 'You', avatarUrl: 'https://i.pravatar.cc/150?img=12' },
      content: newPostText,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
      comments: [],
    };

    // עדכון אופטימיסטי
    setPosts((p) => [newPost, ...p]);
    setNewPostText('');

    try {
      if (API_URL) {
        await axios.post(`${API_URL}/posts`, { content: newPost.content }, { withCredentials: true });
        // אפשר לרענן מהשרת במידת הצורך
      }
    } catch (err) {
      console.error('Failed to post:', err);
      // בהנחה שנרצה להתקן, אפשר להסיר את הפוסט האופטימיסטי או לסמן שגיאה
    }
  };

  const toggleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = !p.likedByMe;
        return {
          ...p,
          likedByMe: liked,
          likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      })
    );

    try {
      if (API_URL) {
        await axios.post(`${API_URL}/posts/${postId}/like`, null, { withCredentials: true });
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return (
    <>
      <MenuBar />
      <div className="dashboard-page">
        <div className="container bootdey">
          <div className="col-md-12 bootstrap snippets">
            <div className="panel">
              <div className="panel-body">
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="What are you thinking?"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                />
                <div className="mar-top clearfix">
                  <button className="btn btn-sm btn-primary pull-right" type="button" onClick={handleShare}>
                    <i className="fa fa-pencil fa-fw" /> Share
                  </button>
                  <a className="btn btn-trans btn-icon fa fa-video-camera add-tooltip" href="#" />
                  <a className="btn btn-trans btn-icon fa fa-camera add-tooltip" href="#" />
                  <a className="btn btn-trans btn-icon fa fa-file add-tooltip" href="#" />
                </div>
              </div>
            </div>

            {loading ? (
              <div>Loading...</div>
            ) : (
              posts.map((post) => (
                <div className="panel" key={post.id}>
                  <div className="panel-body">
                    <div className="media-block">
                      <a className="media-left" href="#">
                        <img className="img-circle img-sm" alt="Profile" src={post.author.avatarUrl || 'https://i.pravatar.cc/150'} />
                      </a>
                      <div className="media-body">
                        <div className="mar-btm">
                          <a href="#" className="btn-link text-semibold media-heading box-inline">
                            {post.author.name}
                          </a>
                          <p className="text-muted text-sm">
                            <i className="fa fa-mobile fa-lg" /> - {formatRelative(post.createdAt)}
                          </p>
                        </div>
                        <p>{post.content}</p>

                        {post.imageUrl && <img className="img-responsive thumbnail" src={post.imageUrl} alt="Post" />}

                        <div className="pad-ver">
                          <div className="btn-group">
                            <button className={`btn btn-sm btn-default btn-hover-success ${post.likedByMe ? 'active' : ''}`} onClick={() => toggleLike(post.id)}>
                              <i className="fa fa-thumbs-up" />
                            </button>
                            <button className="btn btn-sm btn-default btn-hover-danger">
                              <i className="fa fa-thumbs-down" />
                            </button>
                          </div>
                          <a className="btn btn-sm btn-default btn-hover-primary" href="#">Comment</a>
                        </div>

                        <hr />

                        {/* comments */}
                        {post.comments && post.comments.length > 0 && (
                          <div>
                            {post.comments.map((c) => (
                              <div className="media-block" key={c.id} style={{ marginBottom: 12 }}>
                                <a className="media-left" href="#">
                                  <img className="img-circle img-sm" alt="Profile" src={c.author.avatarUrl || 'https://i.pravatar.cc/150?img=5'} />
                                </a>
                                <div className="media-body">
                                  <div className="mar-btm">
                                    <a href="#" className="btn-link text-semibold media-heading box-inline">
                                      {c.author.name}
                                    </a>
                                    <p className="text-muted text-sm">{formatRelative(c.createdAt)}</p>
                                  </div>
                                  <p>{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

// ------- עזרי תצוגה ונתוני דמה -------
function formatRelative(iso: string) {
  try {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } catch {
    return iso;
  }
}

function getMockPosts(): Post[] {
  return [
    {
      id: 'p1',
      author: { name: 'Lisa D.', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar1.png' },
      content:
        'consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
      createdAt: new Date(Date.now() - 11 * 60000).toISOString(),
      likes: 12,
      likedByMe: false,
      comments: [
        {
          id: 'c1',
          author: { name: 'Bobby Marz', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar2.png' },
          content:
            'Sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
          createdAt: new Date(Date.now() - 7 * 60000).toISOString(),
        },
        {
          id: 'c2',
          author: { name: 'Lucy Moon', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar3.png' },
          content: 'Duis autem vel eum iriure dolor in hendrerit in vulputate ?',
          createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        },
      ],
    },
    {
      id: 'p2',
      author: { name: 'John Doe', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar1.png' },
      content: 'Lorem ipsum dolor sit amet.',
      imageUrl: 'https://www.bootdey.com/image/400x300',
      createdAt: new Date(Date.now() - 70 * 60000).toISOString(),
      likes: 250,
      likedByMe: false,
      comments: [
        {
          id: 'c3',
          author: { name: 'Maria Leanz', avatarUrl: 'https://bootdey.com/img/Content/avatar/avatar2.png' },
          content: 'Duis autem vel eum iriure dolor in hendrerit in vulputate ?',
          createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        },
      ],
    },
  ];
}


/* Dashboard.css */
/* שמור את ההגדרות האלו כ- src/pages/Dashboard.css */
