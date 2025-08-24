import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import "./Home.css";
import MonacoEditor from "../components/MonacoEditor";
import axios from "axios";

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
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("https://backend-codemode-9p1s.onrender.com/api/user/me", { withCredentials: true })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .then(() => setLoadingAuth(false));
  }, []);

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

  if (loadingAuth) {
    return (
      <>
        <MenuBar />
        <div className="profile-page">
          <h1>Checking authentication...</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <MenuBar />

      <div className="animated-title-container">
        <div className="split-text-container">
          <span className="text-part left">Learn With </span>
          <span className="text-part right">Your AI Mentor</span>
        </div>
      </div>

      <div className="cards-list">
        {/* עוזר אישי */}
        <div className="card-section special-card">
          <div className="card">
            <h2>Personal AI Assistant</h2>
            {!isLoggedIn ? (
              <>
                <p>To use the personal AI assistant, please log in or sign up.</p>
                <button
                  onClick={() =>
                    navigate("/login", { state: { redirectTo: "/practice" } })
                  }
                  className="login-button"
                >
                  Login / Sign Up
                </button>
              </>
            ) : (
              <p>Welcome back! Use the AI assistant to enhance your coding skills.</p>
            )}
          </div>
        </div>

        {/* תכנות */}
        <div className="card-section">
          <div className="side-text left text-white">AI Learns </div>
          <div className="card">
            <div className="icon">
              <i className="fa-thin fa-laptop-code"></i>
            </div>
            <div className="text-content">
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
        <div className="card-section exercises-samples">
          <h3>Sample Exercises</h3>

          <div className="language-card-grid">
            {Object.keys(exercisesByLanguage).map((lang) => (
              <button
                key={lang}
                className={`language-card ${
                  selectedLanguage === lang ? "active" : ""
                }`}
                onClick={() => handleLanguageSelect(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <ul>
            {exercises.map((ex, index) => (
              <li
                key={index}
                onClick={() => handleExerciseSelect(ex)}
                className={selectedExercise === ex ? "selected" : ""}
                style={{
                  cursor: "pointer",
                  fontWeight: selectedExercise === ex ? "bold" : "normal",
                }}
              >
                {`Exercise ${index + 1}: ${ex}`}
              </li>
            ))}
          </ul>

          {selectedExercise && (
            <div className="selected-exercise">
              <h4>Selected Exercise:</h4>
              <p>{selectedExercise}</p>
            </div>
          )}

          <button
            onClick={handleMoreExercisesClick}
            className="more-exercises-button"
            disabled={!selectedExercise}
          >
            {selectedExercise ? "Start This Exercise" : "Select an Exercise First"}
          </button>
        </div>

        <MonacoEditor />

        {/* כרטיסים נוספים רק למשתמשים מחוברים */}
        {isLoggedIn && (
          <>
            <div className="card-section">
              <div className="side-text left text-black">Your Progress</div>
              <div className="card">
                <div className="icon">
                  <i className="fa-thin fa-chart-line"></i>
                </div>
                <div className="text-content">
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
                <div className="icon">
                  <i className="fa-thin fa-lightbulb-on"></i>
                </div>
                <div className="text-content">
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
            <div className="icon">
              <i className="fa-thin fa-shield-check"></i>
            </div>
            <div className="text-content">
              <h2>Security</h2>
              <p>
                Learn how to write secure and protected code with our guided
                exercises. Understand vulnerabilities and how to avoid them.
              </p>
            </div>
          </div>
        </div>

        {/* תחזוקה */}
        <div className="card-section">
          <div className="side-text left text-black">Maintain Like a Pro</div>
          <div className="card">
            <div className="icon">
              <i className="fa-thin fa-wrench-simple"></i>
            </div>
            <div className="text-content">
              <h2>Maintenance</h2>
              <p>
                Understand best practices for code maintenance and real-world
                development. Keep your projects clean, manageable, and scalable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
