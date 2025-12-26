import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import "./Home.css";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ הוספת SweetAlert2

const LazyMonacoEditor = React.lazy(() => import("../components/MonacoEditor"));

const exercisesByLanguage: Record<string, string[]> = {
  javascript: [
    "Write a function to reverse a string",
    "Implement Fibonacci sequence",
    "Validate an email address format",
  ],
  python: [
    "Check if a number is prime",
    "Calculate factorial using recursion",
    "Parse a JSON string and print values",
  ],
  java: [
    "Create a class with getters and setters",
    "Implement bubble sort algorithm",
    "Check if a string is a palindrome",
  ],
  typescript: [
    "Define interfaces and use them in a function",
    "Create a generic function",
    "Validate object with optional properties",
  ],
  csharp: [
    "Create a simple console application",
    "Use LINQ to filter a list",
    "Implement exception handling",
  ],
  cpp: [
    "Write a program to swap two numbers",
    "Implement a stack using arrays",
    "Use pointers to access array elements",
  ],
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const editorSentinelRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadEditor, setShouldLoadEditor] = useState(false);

  const supportsIO = useMemo(() => typeof window !== "undefined" && "IntersectionObserver" in window, []);

  // ✅ Alert של קוקיז
  useEffect(() => {
    const cookiesChoice = localStorage.getItem("cookiesChoice");

    if (!cookiesChoice) {
      Swal.fire({
        title: "Cookies Consent",
        text: "This website uses cookies to enhance your experience. Do you accept?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Accept",
        cancelButtonText: "Decline",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.setItem("cookiesChoice", "accepted");
          Swal.fire("Thank you!", "You have accepted cookies.", "success");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          localStorage.setItem("cookiesChoice", "declined");
          Swal.fire(
            "Notice",
            "You have declined cookies. Some features may not work properly.",
            "warning"
          );
        }
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    axios
      .get("https://backend-codemode-9p1s.onrender.com/user/me", { withCredentials: true })
      .then(() => {
        if (mounted) setIsLoggedIn(true);
      })
      .catch(() => {
        if (mounted) setIsLoggedIn(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Defer loading the Monaco bundle until the editor area is near the viewport.
  useEffect(() => {
    if (shouldLoadEditor) return;
    if (!supportsIO) {
      setShouldLoadEditor(true);
      return;
    }

    const element = editorSentinelRef.current;
    if (!element) {
      setShouldLoadEditor(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setShouldLoadEditor(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoadEditor, supportsIO]);

  const handleMoreExercisesClick = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: "/practice" } });
    } else {
      navigate("/practice", {
        state: { language: selectedLanguage, exercise: selectedExercise },
      });
    }
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    setSelectedExercise(null); // איפוס בחירת תרגיל אם השפה משתנה
  };

  const handleExerciseSelect = (exercise: string) => {
    setSelectedExercise(exercise);
  };

  const exercises = exercisesByLanguage[selectedLanguage] || [];

  return (
    <>
      <MenuBar />

      <main className="main-container" aria-live="polite">
        {/* עוזר אישי */}
        <div className="card-section special-card" aria-label="Personal AI Assistant">
          <div className="card">
            <div className="text-content">
              <h2>Personal AI Assistant</h2>
              {!isLoggedIn ? (
                <>
                  <p>
                    To use the personal AI assistant, please log in or sign up.
                  </p>
                  <button
                    onClick={() =>
                      navigate("/login", { state: { redirectTo: "/practice" } })
                    }
                    className="login-button"
                    aria-label="Login or sign up"
                  >
                    Login / Sign Up
                  </button>
                </>
              ) : (
                <p>Welcome back! Use the AI assistant to enhance your coding skills.</p>
              )}
            </div>
          </div>
        </div>

        <div className="animated-title-container">
          <div className="split-text-container" aria-hidden={false}>
            <span className="text-part left">Learn With </span>
            <span className="text-part right">Your AI Mentor</span>
          </div>
        </div>

        <div className="cards-list">
          {/* תכנות */}
          <div className="card-section">
            <div className="side-text left text-white">AI Learns </div>
            <div className="card">
              <div className="icon" aria-hidden>
                <i className="fa-thin fa-laptop-code"></i>
              </div>
              <div className="text-content" style={{ minWidth: 0 }}>
                <h2>Programming</h2>
                <p>
                  Practice coding with real-time AI assistance and improve your
                  skills. Work on challenges, get feedback, and level up your
                  coding game.
                </p>
              </div>
            </div>
          </div>

          {/* תרגילים עם בחירת שפה ובחירת תרגיל */}
          <div className="card-section exercises-samples" role="region" aria-label="Sample exercises">
            <h3>Sample Exercises</h3>

            <div className="language-card-grid" role="tablist" aria-label="Languages">
              {Object.keys(exercisesByLanguage).map((lang) => (
                <button
                  key={lang}
                  className={`language-card ${selectedLanguage === lang ? "active" : ""}`}
                  onClick={() => handleLanguageSelect(lang)}
                  aria-pressed={selectedLanguage === lang}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <ul role="list" aria-label={`${selectedLanguage} exercises`}>
              {exercises.map((ex, index) => (
                <li
                  key={index}
                  role="listitem"
                  onClick={() => handleExerciseSelect(ex)}
                  className={`exercise-item ${selectedExercise === ex ? "selected" : ""}`}
                >
                  {`Exercise ${index + 1}: ${ex}`}
                </li>
              ))}
            </ul>

            {selectedExercise && (
              <div className="selected-exercise" aria-live="polite">
                <h4>Selected Exercise:</h4>
                <p>{selectedExercise}</p>
              </div>
            )}

            <button
              onClick={handleMoreExercisesClick}
              className="more-exercises-button"
              disabled={!selectedExercise}
              aria-disabled={!selectedExercise}
            >
              {selectedExercise ? "Start This Exercise" : "Select an Exercise First"}
            </button>
          </div>

          <section className="home-editor-section" aria-label="Code editor">
            <div className="home-editor-container">
              <div ref={editorSentinelRef} />
              {shouldLoadEditor ? (
                <Suspense fallback={<div style={{ padding: "1rem" }}>Loading editor…</div>}>
                  <LazyMonacoEditor />
                </Suspense>
              ) : (
                <div style={{ padding: "1rem" }}>Scroll to load the editor…</div>
              )}
            </div>
          </section>

          {/* כרטיסים נוספים רק למשתמשים מחוברים */}
          {isLoggedIn && (
            <>
              <div className="card-section">
                <div className="side-text left text-black">Your Progress</div>
                <div className="card">
                  <div className="icon" aria-hidden>
                    <i className="fa-thin fa-chart-line"></i>
                  </div>
                  <div className="text-content" style={{ minWidth: 0 }}>
                    <h2>Practice History</h2>
                    <p>
                      View your past exercises, track your coding journey, and
                      revisit challenges you've completed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-section reverse">
                <div className="side-text right text-black">For You</div>
                <div className="card">
                  <div className="icon" aria-hidden>
                    <i className="fa-thin fa-lightbulb-on"></i>
                  </div>
                  <div className="text-content" style={{ minWidth: 0 }}>
                    <h2>Recommended Topics</h2>
                    <p>
                      Receive personalized coding exercises based on your skill
                      level and learning progress.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* אבטחה */}
          <div className="card-section reverse">
            <div className="side-text right text-gray">Secure Your Skills</div>
            <div className="card">
              <div className="icon" aria-hidden>
                <i className="fa-thin fa-shield-check"></i>
              </div>
              <div className="text-content" style={{ minWidth: 0 }}>
                <h2>Security</h2>
                <p>
                  Learn how to write secure and protected code with our guided
                  exercises. Understand vulnerabilities and how to avoid them.
                </p>
              </div>
            </div>
          </div>

          {/* תחזוקה */}
          <div className="card-section maintenance-section">
            <div className="card">
              <div className="icon" aria-hidden>
                <i className="fa-thin fa-wrench-simple"></i>
              </div>
              <div className="text-content" style={{ minWidth: 0 }}>
                <h2>Maintenance</h2>
                <p>
                  Understand best practices for code maintenance and real-world
                  development. Keep your projects clean, manageable, and scalable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
