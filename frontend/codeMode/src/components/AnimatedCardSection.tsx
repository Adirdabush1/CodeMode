import React, { useRef, useState, useEffect } from "react";

interface AnimatedCardSectionProps {
  reverse?: boolean;
  sideTextClass: string;
  sideText: string;
  iconClass: string;
  title: string;
  description: string;
}

const AnimatedCardSection: React.FC<AnimatedCardSectionProps> = ({
  reverse = false,
  sideTextClass,
  sideText,
  iconClass,
  title,
  description,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // מפסיקים לצפות אחרי שהכרטיס הופיע
        }
      },
      { threshold: 0.3 } // הכרטיס נחשב נראה כשהוא ב-30% ב-view
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`card-section${reverse ? " reverse" : ""} ${
        visible ? "visible" : "hidden"
      }`}
    >
      <div className={`side-text ${sideTextClass}`}>{sideText}</div>
      <div className="card">
        <div className="icon">
          <i className={iconClass}></i>
        </div>
        <div className="text-content">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCardSection;
