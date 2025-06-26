import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import members from '../components/membersData';
import '../css/teamPage.css'; // You should update this file with the new class names too

export default function MemberPage() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const member = members[memberId];

  if (!member) {
    return <h2 style={{ textAlign: 'center' }}>Member not found</h2>;
  }

  return (
    <div>
      <section className="member-profile-section">
        <div className="member-profile-card">
          <img
            src={member.image}
            alt={`${member.name} Profile`}
            className="member-profile-image"
          />
          <div className="member-info">
            <h2>{member.name}</h2>
            <p><strong>Age:</strong> {member.age}</p>
            <p><strong>Location:</strong> {member.location}</p>
            <p><strong>Education:</strong> {member.education}</p>
            <p><strong>Hobbies:</strong> {member.hobbies}</p>
            <p><strong>Favorite Quote:</strong> {member.quote}</p>
          </div>
        </div>

        <div className="member-introduction">
          <h3>Introduction</h3>
          <p>{member.intro}</p>
        </div>
      </section>

      <button className="member-back-button" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
}