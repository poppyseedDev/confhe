import React, { useState } from 'react';
import {
  useCreateProposal,
  useGetProposal,
  useCastVote,
  useDecryptVoteCount,
} from '../../hooks/useBallotContract';

const BallotTester: React.FC = () => {
  const [proposalName, setProposalName] = useState('');
  const [proposalIndex, setProposalIndex] = useState(0);
  const [proposalData, setProposalData] = useState<any | null>(null);
  const [votes, setVotes] = useState<boolean[]>([false, false, false]);
  const [proof, setProof] = useState('');
  const [status, setStatus] = useState<boolean | null>(null);

  const { createProposal } = useCreateProposal();
  const { getProposal } = useGetProposal();
  const { castVote } = useCastVote();
  const { decryptVoteCount } = useDecryptVoteCount();

  const handleCreateProposal = async () => {
    if (proposalName) {
      await createProposal(proposalName);
      alert(`Proposal "${proposalName}" created.`);
      setProposalName('');
    } else {
      alert('Proposal name cannot be empty.');
    }
  };

  const handleGetProposal = async () => {
    const data = await getProposal(proposalIndex);
    setProposalData(data);
  };

  const handleCastVote = async () => {
    if (votes.length === 3 && proof) {
      await castVote(votes, proof);
      alert('Vote cast successfully.');
    } else {
      alert('Please set valid votes and proof.');
    }
  };

  const handleDecryptVoteCount = async () => {
    await decryptVoteCount(proposalIndex);
    alert('Decryption request sent.');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Ballot Tester</h1>

      <div style={{ marginBottom: '20px' }}>
        <h3>Create Proposal</h3>
        <input
          type="text"
          value={proposalName}
          onChange={(e) => setProposalName(e.target.value)}
          placeholder="Proposal Name"
        />
        <button onClick={handleCreateProposal}>Create</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Get Proposal</h3>
        <input
          type="number"
          value={proposalIndex}
          onChange={(e) => setProposalIndex(Number(e.target.value))}
          placeholder="Proposal Index"
        />
        <button onClick={handleGetProposal}>Get Proposal</button>
        {proposalData && (
          <div>
            <p>Proposal Name: {proposalData.name}</p>
            <p>Encrypted Vote Count: {proposalData.voteCount}</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Cast Vote</h3>
        <label>
          Votes:
          <input
            type="text"
            value={votes.join(',')}
            onChange={(e) =>
              setVotes(
                e.target.value.split(',').map((v) => v.trim() === 'true'),
              )
            }
            placeholder="true,false,true"
          />
        </label>
        <input
          type="text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="Proof"
        />
        <button onClick={handleCastVote}>Vote</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Decrypt Vote Count</h3>
        <input
          type="number"
          value={proposalIndex}
          onChange={(e) => setProposalIndex(Number(e.target.value))}
          placeholder="Proposal Index"
        />
        <button onClick={handleDecryptVoteCount}>Decrypt Vote Count</button>
      </div>
    </div>
  );
};

export default BallotTester;
