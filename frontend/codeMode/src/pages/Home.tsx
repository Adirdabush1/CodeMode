import React from "react";
import MenuBar from "../components/MenuBar";
import "./Home.css";
import MonacoEditor from "../components/MonacoEditor";
const Home: React.FC = () => {
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
        <div className="card-section">
          <div className="side-text left text-white">AI Learns </div>
          <div className="card">
            <div className="icon">
              <i className="fa-thin fa-laptop-code"></i>
            </div>
            <div className="text-content">
              <h2>Programming</h2>
              <p>
                Practice coding with real-time AI assistance and improve your skills.
                Work on challenges, get feedback, and level up your coding game.
              </p>
            </div>
          </div>
        </div>
<MonacoEditor/>

        <div className="card-section reverse">
          <div className="side-text right text-gray">Secure Your Skills</div>
          <div className="card">
            <div className="icon">
              <i className="fa-thin fa-shield-check"></i>
            </div>
            <div className="text-content">
              <h2>Security</h2>
              <p>
                Learn how to write secure and protected code with our guided exercises.
                Understand vulnerabilities and how to avoid them.
              </p>
            </div>
          </div>
        </div>

        <div className="card-section">
          <div className="side-text left text-black">Maintain Like a Pro</div>
          <div className="card">
            <div className="icon">
              <i className="fa-thin fa-wrench-simple"></i>
            </div>
            <div className="text-content">
              <h2>Maintenance</h2>
              <p>
                Understand best practices for code maintenance and real-world development.
                Keep your projects clean, manageable, and scalable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
