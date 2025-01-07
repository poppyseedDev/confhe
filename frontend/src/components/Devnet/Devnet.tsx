import { useEffect, useState } from 'react';
import './Devnet.css';
import { ethers } from 'ethers';
import Ballot from '@deployments/sepolia/Ballot.json';

export type DevnetProps = {
  account: string;
  provider: ethers.providers.Web3Provider;
  onConnectionSuccess: () => void;
};

export const Devnet = ({
  account,
  provider,
  onConnectionSuccess,
}: DevnetProps) => {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [ballotStatus, setBallotStatus] = useState<boolean | null>(null);
  const BallotABI = Ballot.abi;
  useEffect(() => {
    const loadData = async () => {
      try {
        let Ballot;
        if (!import.meta.env.MOCKED) {
          Ballot = await import('@deployments/sepolia/Ballot.json');
          console.log(
            `Using ${Ballot.address} for the Ballot contract on Sepolia`,
          );
        } else {
          Ballot = await import('@deployments/localhost/Ballot.json');
          console.log(
            `Using ${Ballot.address} for the Ballot contract on Hardhat Local Node`,
          );
        }

        setContractAddress(Ballot.address);
        alert('Conexión exitosa con el contrato Ballot');
        onConnectionSuccess();
      } catch (error) {
        console.error(
          'Error loading Ballot contract data. Make sure the contract is deployed and accessible:',
          error,
        );
      }
    };

    loadData();
  }, [onConnectionSuccess]);

  const getBallotStatus = async () => {
    if (contractAddress) {
      try {
        const contract = new ethers.Contract(
          contractAddress,
          BallotABI,
          provider,
        );
        const status = await contract.get_ballot_status();
        setBallotStatus(status);
        console.log(`Ballot status: ${status}`);
      } catch (error) {
        console.error('Error fetching ballot status:', error);
      }
    }
  };

  return (
    <div>
      <p>Connected to Ballot Contract at: {contractAddress}</p>
      <button onClick={getBallotStatus}>Check Ballot Status</button>
      {ballotStatus !== null && (
        <p>Ballot Status: {ballotStatus ? 'Finished' : 'Active'}</p>
      )}
    </div>
  );
};