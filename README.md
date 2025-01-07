

### Overview

This project implements a confidential voting system using Fully Homomorphic Encryption (FHE) on the Ethereum blockchain. The Ballot contract allows for secure and private voting on proposals, ensuring that vote counts remain confidential until they are decrypted.

### Features

🧪 This is a draft for a voting dApp designed to facilitate use Fully Homomorphic Encryption for secure voting. By leveraging the fhevm encrypted data types, this dApp ensures voting data integrity, privacy and process transparency.

⚙️ Built using React, Hardhat, Wagmi, Viem, and Typescript.

- **Secure and Transparent**: Ensures votes are securely recorded on the blockchain and visible for verification only after the voting process is finished.

- **No Trusted Coordinator**: The system does not rely on a trusted third party to coordinate the election or manage votes.

- **Result Disclosure**: Results are only available once the election has ended. No one can decrypt individual votes.

- **Ballot Management**: Supports creating proposals, casting votes, and determining the winner.

- This particular implementation serves as a demonstration, as a contract needs to be deployed for each ballot, in a real world use case there are a lot of constrains that should be prepared via a ballot factory contract for example to config the ballot acoordingly.

### Usage

1. Deploy Contract: Deploy the Ballot contract using the deployment script.
2. Create Proposals: Use the createProposal function to add proposals to the ballot.
3. Start Ballot: Start the ballot using the startBallot function.
4. Cast Votes: Cast votes using the castVote function.
5. Finish Ballot: Finish the ballot using the finishBallot function and retrieve the results.

- Run tests using `npm run test` and check `/test/ballot/Ballot.ts` for guidance.
