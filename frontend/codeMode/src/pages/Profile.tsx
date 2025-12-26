import React from "react";
import "./Profile.css";
import MenuBar from "../components/MenuBar";

type SolvedExercise = {
  exerciseId: string;
  name?: string; // שם התרגיל
  code: string;
  solvedAt: string | Date;
};

type ProfileProps = {
  name: string;
  title: string;
  description: string;
  points: number;
  level: string;
  exercisesSolved: number;
  successRate: number;
  avgSolveTime: string;
  email: string;
  githubUrl: string;
  status: string;
  badges: string[];
  avatarUrl: string;
  solvedExercises?: SolvedExercise[];
};

const Profile: React.FC<ProfileProps> = ({
  name,
  title,
  description,
  points,
  level,
  exercisesSolved,
  successRate,
  avgSolveTime,
  email,
  githubUrl,
  status,
  badges,
  avatarUrl,
  solvedExercises = [],
}) => {
  const filteredExercises = solvedExercises.filter(
    (ex) => ex.exerciseId && ex.exerciseId.trim() !== ""
  );

  return (
    <>
      <MenuBar />
      <div className="profile-page">
        
        <div className="container">
          <div className="profile-card">
            <div className="card-glow"></div>
            <div className="card-shine"></div>
            <div className="card-border"></div>

            <div className="card-content">
              <div className="avatar-wrapper">
                <div className="avatar">
                  <div className="avatar-inner"></div>
                  <img src={avatarUrl} alt={`${name} avatar`} className="avatar-image" />
                  <div className="avatar-border"></div>
                  <div className="avatar-glow"></div>
                </div>
              </div>

              <div className="profile-info">
                <h2 className="name">{name}</h2>
                <p className="title">{title}</p>
                <p className="bio">{description}</p>
              </div>

              <div className="stats">
                <div className="stat">
                  <span className="stat-value">{points}</span>
                  <span className="stat-label">Points</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{level}</span>
                  <span className="stat-label">Level</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{exercisesSolved}</span>
                  <span className="stat-label">Solved</span>
                </div>
              </div>

              <div className="stats">
                <div className="stat">
                  <span className="stat-value">{successRate}%</span>
                  <span className="stat-label">Success</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{avgSolveTime}</span>
                  <span className="stat-label">Avg Time</span>
                </div>
              </div>

              <div className="solved-exercises" style={{ marginTop: 20 }}>
                <h3>Solved Exercises</h3>
                {filteredExercises.length === 0 ? (
                  <p>No exercises solved yet.</p>
                ) : (
                  <ul>
                    {filteredExercises.map((ex, i) => (
                      <li key={i}>
                        {ex.name || ex.exerciseId}{" "}
                        {ex.solvedAt && `- solved at: ${new Date(ex.solvedAt).toLocaleString()}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="skills">
                {badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <div key={index} className="skill">{badge}</div>
                  ))
                ) : (
                  <div className="skill">No badges</div>
                )}
              </div>

              <div className="skills">
                <div className="skill">Email: {email}</div>
                <div className="skill">
                  GitHub:{" "}
                  <a href={githubUrl} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>
                    {githubUrl ? githubUrl.replace(/^https?:\/\//, "") : "N/A"}
                  </a>
                </div>
                <div className="skill">Status: {status}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
