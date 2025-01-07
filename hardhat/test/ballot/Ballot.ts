import { expect } from "chai";
import { network } from "hardhat";

import { awaitAllDecryptionResults, initGateway } from "../asyncDecrypt";
import { createInstance } from "../instance";
import { getSigners, initSigners } from "../signers";
import { deployBallot } from "./Ballot.fixture";

describe("Ballot", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
    await initGateway();
  });

  beforeEach(async function () {
    const contract = await deployBallot();
    this.contractAddress = await contract.getAddress();
    this.ballot = contract;
    this.instances = await createInstance();
  });

  it("should deploy the contract", async function () {
    expect(this.contractAddress).to.properAddress;
  });

  it("should not be able to be finished initially", async function () {
    const isFinished = await this.ballot.get_ballot_status();
    expect(isFinished).to.be.false;
  });

  it("should create a proposal", async function () {
    await this.ballot.createProposal("Proposal 1");
    const proposal = await this.ballot.getProposal(0);
    expect(proposal.name).to.equal("Proposal 1");
  });

  it("should start the ballot", async function () {
    await this.ballot.startBallot();
    const startTime = await this.ballot.startTime();
    expect(startTime).to.be.gt(0);
  });

  it("should finish the ballot after duration", async function () {
    await this.ballot.startBallot();
    const active = await this.ballot.isActive();
    expect(active).to.be.true;

    await network.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
    await network.provider.send("evm_mine"); // Mine a new block

    await this.ballot.finishBallot();
    const isFinished = await this.ballot.get_ballot_status();
    const active2 = await this.ballot.isActive();
    expect(active2).to.be.false;
    expect(isFinished).to.be.true;
  });

  it("should allow voting", async function () {
    await this.ballot.createProposal("Proposal 1");
    await this.ballot.createProposal("Proposal 2");
    await this.ballot.createProposal("Proposal 3");
    await this.ballot.startBallot();

    // Encrypt and cast votes
    const votes = [
      [true, false, false],
      [true, false, false],
      [true, false, false],
      [false, true, false]
    ];

    for (const vote of votes) {
      const input = this.instances.createEncryptedInput(this.contractAddress, this.signers.alice.address);
      input.addBool(vote[0]).addBool(vote[1]).addBool(vote[2]);
      const support = await input.encrypt();

      const tx = await this.ballot.castVote(support.handles[0], support.handles[1], support.handles[2], support.inputProof);
      await tx.wait();
    }

    await this.ballot.finishBallot();
    await awaitAllDecryptionResults();

    const results = await this.ballot.getResults();
    expect(results[0]).to.equal(3);
    expect(results[1]).to.equal(1);
    expect(results[2]).to.equal(0);

    const winner = await this.ballot.getWinner();
    expect(winner).to.equal(0);
  });

  // Uncomment and complete these tests if needed
  // it("should get the correct result after ballot is finished", async function () {
  //   await this.ballot.createProposal("Proposal 1");
  //   await this.ballot.createProposal("Proposal 2");
  //   await this.ballot.startBallot();
  //   await this.ballot.castVote(0);
  //   await this.ballot.castVote(0);
  //   await this.ballot.castVote(1);
  //   await network.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
  //   await network.provider.send("evm_mine"); // Mine a new block
  //   await this.ballot.finishBallot();
  //   const result = await this.ballot.get_result();
  //   expect(result.name).to.equal("Proposal 1");
  //   expect(result.voteCount).to.equal(2);
  // });

  // it("should not allow voting after ballot is finished", async function () {
  //   await this.ballot.createProposal("Proposal 1");
  //   await this.ballot.startBallot();
  //   await network.provider.send("evm_increaseTime", [3600]); // Increase time by 1 hour
  //   await network.provider.send("evm_mine"); // Mine a new block
  //   await this.ballot.finishBallot();
  //   const isFinished = await this.ballot.get_ballot_status();
  //   await expect(this.ballot.castVote(0)).to.be.revertedWith("Ballot is finished");
  // });
});
