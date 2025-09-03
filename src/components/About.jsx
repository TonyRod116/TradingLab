import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaBolt, 
  FaTools, 
  FaCrosshairs, 
  FaRocket 
} from 'react-icons/fa';
import Header from './Header';
import './About.css';

const TECH_STACK = [
  { icon: '⚛️', name: 'React + Vite', description: 'Modern frontend framework' },
  { icon: '🐍', name: 'Django + DRF', description: 'Robust backend API' },
  { icon: '🗄️', name: 'PostgreSQL', description: 'Reliable database' },
  { icon: '🔐', name: 'JWT Auth', description: 'Secure authentication' },
  { icon: '🎨', name: 'CSS Variables', description: 'Dynamic theming' },
  { icon: '☕', name: 'Coffee', description: 'Essential fuel' }
];

const About = () => {
  const renderTechStack = () => (
    <div className="tech-grid">
      {TECH_STACK.map((tech, index) => (
        <div key={index} className="tech-item">
          <span className="tech-icon">{tech.icon}</span>
          <div className="tech-details">
            <span className="tech-name">{tech.name}</span>
            <span className="tech-description">{tech.description}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="about-page">
      <Header />
      <div className="about-container">
        <div className="about-hero">
          <h1>About TradeLab</h1>
          <p>The trading platform that proves you can build anything in 8 days... if you're desperate enough</p>
        </div>

        <div className="about-content">
          <div className="about-section">
            <h2><FaGraduationCap /> The GA Origin Story</h2>
            <p>
              Picture this: It's the final week of General Assembly's Software Engineering bootcamp, 
              and I'm staring at a blank screen wondering how I'm going to build something impressive 
              in just 8 days. Cue the panic, the coffee consumption, and the questionable life choices.
            </p>
            <p>
              <strong>TradeLab</strong> was born from this beautiful chaos - a strategy backtesting 
              platform that I somehow managed to build while surviving on leftover pizza, reheated coffee, and the kind of sleep deprivation that makes you question if you're actually a human or just a very advanced coffee machine. All while being the best possible parent I could be with my 1-year-old son (who thinks my laptop is a toy and my code is just fancy scribbles)
            </p>
            <p>
                          <em>Speaking of my son - in the 30 seconds I left him alone with my laptop, he managed to: 
            send a "3" to the General Assembly Slack group (probably testing the keyboard and accidentally 
            hitting Enter), open a Windows command prompt that I didn't even know existed (and still don't 
            know how he did it), and probably would have deployed this to production if I hadn't intervened. 
            Kids these days are natural-born developers, I tell you.</em>
            </p>
          </div>

          <div className="about-section">
            <h2><FaBolt /> What Actually Happened</h2>
            <p>
              In 8 days that felt like a month, I went from "I should practice Django" to "I'm deploying 
              a full-stack application with React frontend, Django backend, JWT authentication, and 
              a PostgreSQL database." Spoiler alert: I'm still not entirely sure how I pulled it off.
            </p>
            <p>
              The project involved more Google searches than I care to admit, countless chatGPT 
              visits, and at least one existential crisis about whether I actually learned anything 
              in the past 12 weeks.
            </p>
          </div>

          <div className="about-section">
            <h2><FaTools /> The Tech Stack (AKA My Desperation Stack)</h2>
            {renderTechStack()}
          </div>

          <div className="about-section">
            <h2><FaCrosshairs /> The Mission</h2>
            <p>
              Despite the chaotic origins, TradeLab serves a real purpose: helping traders test their 
              strategies before risking real money. It's like a flight simulator, but for strategy testing - 
              you can crash and burn without losing your life savings.
            </p>
            <p>
              Plus, it's a great conversation starter: "Oh, this strategy backtesting platform? Yeah, I built it 
              in 8 days for my coding bootcamp final project. No big deal." (Spoiler: it was a very 
              big deal, and I'm still recovering from the stress.)
            </p>
          </div>

          <div className="about-section">
            <h2><FaRocket /> What's Next?</h2>
            <p>
              Now that the bootcamp is over and I've had time to sleep, I'm planning to add more 
              features like advanced charting, and maybe even some AI-powered 
              strategy suggestions. But first, I need to recover from the trauma of building this 
              in 8 days.
            </p>
            <p>
              <em>P.S. To my future employers: I promise I don't always work this chaotically. 
              This was just a special case of "bootcamp desperation meets deadline panic." 
              But hey, if you're impressed by someone who can build a full-stack app in a week, 
              I'm your developer!</em>
            </p>
          </div>
        </div>

        <div className="about-cta">
          <h2>Ready to Experience the Magic?</h2>
          <p>Join the exclusive club of people who use a platform built in 8 days by a sleep-deprived bootcamp student</p>
          <Link to="/strategies/" className="btn btn-primary">Try It (At Your Own Risk)</Link>
        </div>
      </div>
    </div>
  );
};

export default About;
