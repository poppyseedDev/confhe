import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGetProposal } from '../../hooks/useBallotContract';

interface Candidate {
  id: number;
  party: string;
  icon: string;
  proposals: string[];
}

interface CandidateListProps {
  candidates: Candidate[];
  selectedCandidate: number | null;
  setSelectedCandidate: (id: number | null) => void;
  hasVoted: boolean;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  selectedCandidate,
  setSelectedCandidate,
  hasVoted,
}) => {
  const { getProposal } = useGetProposal();
  const [candidateData, setCandidateData] = useState<Candidate[]>([]);

  const proposalCount = useMemo(() => candidates.length, [candidates]);

  useEffect(() => {
    let isMounted = true;

    const fetchProposals = async () => {
      try {
        const updatedCandidates = await Promise.all(
          candidates.map(async (candidate, index) => {
            const result = await getProposal(index);
            return {
              ...candidate,
              name: result?.data?.name || `Candidate ${index + 1}`,
            };
          }),
        );
        if (isMounted) setCandidateData(updatedCandidates);
      } catch (error) {
        console.error('Error fetching proposals:', error);
      }
    };

    fetchProposals();

    return () => {
      isMounted = false;
    };
  }, [getProposal, proposalCount]); // Stabilized dependencies

  return (
    <motion.ul
      className="candidate-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      {candidateData.map((candidate) => (
        <motion.li
          key={candidate.id}
          className={`candidate ${
            selectedCandidate === candidate.id ? 'selected' : ''
          } ${hasVoted ? 'disabled-candidate' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedCandidate(candidate.id)}
        >
          <div className="candidate-header">
            <span className="candidate-icon">{candidate.icon}</span>
            <div className="candidate-info">
              <span className="candidate-name">{candidate.name}</span>
              <span className="candidate-party">{candidate.party}</span>
            </div>
          </div>
          <ul className="candidate-proposals">
            {candidate.proposals.map((proposal, idx) => (
              <li key={idx}>{proposal}</li>
            ))}
          </ul>
        </motion.li>
      ))}
    </motion.ul>
  );
};