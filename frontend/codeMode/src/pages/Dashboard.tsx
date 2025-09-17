// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuBar from "../components/MenuBar";
import "./Dashbord.css";

const API_URL = process.env.REACT_APP_API_URL || "";

type UserSummary = {
  id?: string;
  name: string;
  avatarUrl?: string;
  email?: string;
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
  const [newPostText, setNewPostText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // טען בו-זמנית את המשתמש והפוסטים
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        if (!API_URL) {
          throw new Error("REACT_APP_API_URL לא מוגדר. הגדר את כתובת ה-API ב-.env");
        }

        const [userRes, postsRes] = await Promise.all([
          axios.get<UserSummary>(`${API_URL}/user/me`, { withCredentials: true }),
          axios.get<Post[]>(`${API_URL}/posts`, { withCredentials: true }),
        ]);

        setCurrentUser(userRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        // אל תטען דמה — רק הודעה רלוונטית
        setErrorMsg("לא ניתן לטעון נתונים מהשרת. ודא שהשרת פועל ושהגדרת REACT_APP_API_URL נכון.");
        setPosts([]); // ריק במקום דמה
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleShare = async () => {
    const content = newPostText.trim();
    if (!content) return;

    // אם אין משתמש מחובר — הסר אפשרות לפרסם
    if (!currentUser) {
      setErrorMsg("עליך להיות מחובר כדי לפרסם פוסט.");
      return;
    }

    // יצירת פוסט באופן אופטימיסטי בצד לקוח
    const optimisticPost: Post = {
      id: `temp-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
      comments: [],
    };

    setPosts((p) => [optimisticPost, ...p]);
    setNewPostText("");

    try {
      const res = await axios.post<Post>(
        `${API_URL}/posts`,
        { content },
        { withCredentials: true }
      );

      // אם השרת מחזיר את הפוסט שנוצר — החלף את הפוסט האופטימיסטי
      if (res.data) {
        setPosts((prev) => prev.map((pt) => (pt.id === optimisticPost.id ? res.data : pt)));
      } else {
        // אם השרת לא החזיר פוסט, אפשר לרענן את כל הרשימה
        const postsRes = await axios.get<Post[]>(`${API_URL}/posts`, { withCredentials: true });
        setPosts(postsRes.data);
      }
    } catch (err) {
      console.error("Failed to post:", err);
      setErrorMsg("שגיאה בשליחת הפוסט — נסה שנית.");
      // הסר את הפוסט האופטימיסטי במקרה של כישלון
      setPosts((prev) => prev.filter((p) => p.id !== optimisticPost.id));
    }
  };

  const toggleLike = async (postId: string) => {
    // עדכון מקומי מהיר
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
      await axios.post(
        `${API_URL}/posts/${postId}/like`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // במקרה של שגיאה — נרענן את הפוסט מהשרת כדי להיות בקונסיסטנטיות
      try {
        const postsRes = await axios.get<Post[]>(`${API_URL}/posts`, { withCredentials: true });
        setPosts(postsRes.data);
      } catch (e) {
        // השאר כמו שיש אם גם הרענון נכשל
        console.error("Also failed to refresh posts after like error:", e);
      }
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
                  placeholder={currentUser ? "What are you thinking?" : "You must be logged in to post"}
                  value={newPostText}
                  onChange={(ev: React.ChangeEvent<HTMLTextAreaElement>) => setNewPostText(ev.target.value)}
                  disabled={!currentUser}
                />
                <div className="mar-top clearfix">
                  <button
                    className="btn btn-sm btn-primary pull-right"
                    type="button"
                    onClick={handleShare}
                    disabled={!currentUser || !newPostText.trim()}
                    title={!currentUser ? "Please login to post" : "Share"}
                  >
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
            ) : errorMsg ? (
              <div style={{ color: "crimson", marginBottom: 12 }}>{errorMsg}</div>
            ) : posts.length === 0 ? (
              <div>No posts yet.</div>
            ) : (
              posts.map((post) => (
                <div className="panel" key={post.id}>
                  <div className="panel-body">
                    <div className="media-block">
                      <a className="media-left" href="#">
                        <img
                          className="img-circle img-sm"
                          alt="Profile"
                          src={post.author.avatarUrl || "https://i.pravatar.cc/150"}
                        />
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
                            <button
                              className={`btn btn-sm btn-default btn-hover-success ${post.likedByMe ? "active" : ""}`}
                              onClick={() => toggleLike(post.id)}
                            >
                              <i className="fa fa-thumbs-up" />
                            </button>
                            <button className="btn btn-sm btn-default btn-hover-danger">
                              <i className="fa fa-thumbs-down" />
                            </button>
                          </div>
                          <a className="btn btn-sm btn-default btn-hover-primary" href="#">
                            Comment
                          </a>
                        </div>

                        <hr />

                        {post.comments && post.comments.length > 0 && (
                          <div>
                            {post.comments.map((c) => (
                              <div className="media-block" key={c.id} style={{ marginBottom: 12 }}>
                                <a className="media-left" href="#">
                                  <img
                                    className="img-circle img-sm"
                                    alt="Profile"
                                    src={c.author.avatarUrl || "https://i.pravatar.cc/150?img=5"}
                                  />
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

/* helpers */
function formatRelative(iso: string) {
  try {
    const then = new Date(iso).getTime();
    const diff = Date.now() - then;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return iso;
  }
}
