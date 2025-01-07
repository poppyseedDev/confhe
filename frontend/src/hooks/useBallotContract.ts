import { useEffect, useState, useCallback } from 'react';
import { BrowserProvider, Contract, Signer } from 'ethers';
import Ballot from '@deployments/sepolia/Ballot.json';
import { CONTRACT_ADDRESS } from '../constants/constants';

export const useBallotContract = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isContractInitialized, setIsContractInitialized] = useState(false);
  const BallotABI = Ballot.abi;

  useEffect(() => {
    const initContract = async () => {
      if (!window.ethereum) {
        console.error('Ethereum wallet not found!');
        return;
      }

      try {
        const web3Provider = new BrowserProvider(window.ethereum);
        const userSigner = await web3Provider.getSigner();

        console.log('ABI:', BallotABI);
        console.log('Address:', CONTRACT_ADDRESS);

        if (!Array.isArray(BallotABI)) {
          throw new Error('Invalid ABI format: ABI is not an array');
        }

        const ballotContract = new Contract(
          CONTRACT_ADDRESS,
          BallotABI,
          userSigner,
        );
        setProvider(web3Provider);
        setSigner(userSigner);
        setContract(ballotContract);
        setIsContractInitialized(true);
        console.log('Contrato inicializado correctamente:', ballotContract);
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    };

    initContract();
  }, []);

  return { provider, signer, contract, isContractInitialized };
};

export const useCreateProposal = () => {
  const { contract } = useBallotContract();

  const createProposal = async (name: string): Promise<void> => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }
    try {
      const tx = await contract.createProposal(name);
      await tx.wait();
      console.log(`Proposal "${name}" created successfully!`);
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  };

  return { createProposal };
};

export const useGetProposal = () => {
  const { contract } = useBallotContract();

  const getProposal = useCallback(
    async (index: number) => {
      if (!contract) {
        console.error('Contract not initialized');
        return { success: false, data: null };
      }
      try {
        const proposal = await contract.getProposal(index);
        return { success: true, data: proposal };
      } catch (error) {
        console.error('Error fetching proposal:', error);
        return { success: false, data: null };
      }
    },
    [contract], // Asegura que se memorice mientras el contrato no cambie
  );

  return { getProposal };
};
export const useCastVote = () => {
  const { contract } = useBallotContract();

  const castVote = async (votes: boolean[], proof: string) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const tx = await contract.castVote(votes[0], votes[1], votes[2], proof);
      await tx.wait();
      console.log('Vote cast successfully!');
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  return { castVote };
};

export const useDecryptVoteCount = () => {
  const { contract } = useBallotContract();

  const decryptVoteCount = async (proposalIndex: number) => {
    if (!contract) {
      console.error('Contract not initialized');
      return;
    }
    try {
      const tx = await contract.decryptedVoteCount(proposalIndex);
      await tx.wait();
      console.log('Decryption request sent!');
    } catch (error) {
      console.error('Error decrypting vote count:', error);
    }
  };

  return { decryptVoteCount };
};

export const useBallotIsActive = () => {
  const { contract } = useBallotContract();
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIsActive = useCallback(async () => {
    if (!contract) {
      console.error('Contract not initialized');
      setError('Contract not initialized');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const active = await contract.isActive();
      setIsActive(active);
      setError(null);
    } catch (err) {
      console.error('Error checking ballot status:', err);
      setError('Failed to check ballot status');
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchIsActive();
  }, [fetchIsActive]);

  return { isActive, loading, error, refresh: fetchIsActive };
};

export const useStartBallot = () => {
  const { contract } = useBallotContract();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const startBallot = useCallback(async () => {
    if (!contract) {
      console.error('Contract not initialized');
      setError('Contract not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const tx = await contract.startBallot();
      await tx.wait();

      console.log('Ballot started successfully!');
      setSuccess(true);
    } catch (err: any) {
      console.error('Error starting ballot:', err);
      setError('Failed to start the ballot');
    } finally {
      setLoading(false);
    }
  }, [contract]);

  return { startBallot, loading, error, success };
};

export const useFinishBallot = () => {
  const { contract } = useBallotContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishBallot = async (): Promise<void> => {
    if (!contract) {
      setError('Contract not initialized');
      console.error('Contract not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.finishBallot();
      await tx.wait();
      console.log('Ballot finished successfully!');
    } catch (err: any) {
      console.error('Error finishing ballot:', err);
      setError(err.message || 'Failed to finish the ballot.');
    } finally {
      setLoading(false);
    }
  };

  return { finishBallot, loading, error };
};