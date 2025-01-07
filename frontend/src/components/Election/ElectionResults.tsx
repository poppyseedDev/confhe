import React, { useEffect, useState } from 'react';

interface Candidate {
  id: number;
  name: string;
  party: string;
  icon: string;
  votes: number;
}

interface ElectionResultsProps {
  candidates: Candidate[];
  resetElection: () => void;
  getVotePercentage: (votes: number, totalVotes: number) => string;
}

export const ElectionResults: React.FC<ElectionResultsProps> = ({
  candidates,
  resetElection,
  getVotePercentage,
}) => {
  const [candidatesWithVotes, setCandidatesWithVotes] = useState<Candidate[]>([]);

  useEffect(() => {
    // Asigna votos aleatorios solo la primera vez que se renderiza el componente
    const initializedCandidates = candidates.map((candidate) => ({
      ...candidate,
      votes: candidate.votes || Math.floor(Math.random() * 500) + 1, // Genera votos entre 1 y 500
    }));
    setCandidatesWithVotes(initializedCandidates);
  }, [candidates]);

  const totalVotes = candidatesWithVotes.reduce((sum, c) => sum + c.votes, 0);

  return (
    <div className="results-section">
      <h2>Election Results</h2>
      <ul className="results-list">
        {candidatesWithVotes.map((candidate) => (
          <li key={candidate.id} className="result-item">
            {candidate.icon} {candidate.name} ({candidate.party}):{' '}
            {candidate.votes} votes ({getVotePercentage(candidate.votes, totalVotes)})
          </li>
        ))}
      </ul>
      <button onClick={resetElection}>Reset Election</button>
    </div>
  );
};