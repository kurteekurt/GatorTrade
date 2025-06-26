import React from 'react';
import { Link } from 'react-router-dom';
import members from '../components/membersData'; 
import '../css/teamPage.css';

export default function TeamIntro() {
  return (
    <div>
      <h2 className="team-section-title">Meet Team 8</h2>

      <section className="team-grid-section">
        {Object.entries(members).map(([id, member]) => (
          <Link to={`/TeamPage/${id}`} className="team-card" key={id}>
            <img src={member.image} alt={`Photo of ${member.name}`} />
            <p className="team-name">{member.name}</p>
          </Link>
        ))}
      </section>

      <footer className="footas">© 2025 Gator Trade - Group 8</footer>
    </div>
  );
}