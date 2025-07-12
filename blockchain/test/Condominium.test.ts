import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import hre, { ethers } from "hardhat";

import { Options } from './shared/Options';
import { Status } from './shared/status';
import { Category } from "./shared/category";
import { Condominium } from "../typechain-types";
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe("Condominium", function () {

  async function addVotes(contract: Condominium, count: number, accounts: SignerWithAddress[], topicName: string, option: Options = Options.YES) {
    for (let i = 1; i <= count; i++) {
      const instance = contract.connect(accounts[i - 1]);
      await instance.vote(topicName, option);

    }
  }

  async function addResidents(contract: Condominium, count: number, accounts: SignerWithAddress[]) {
    for (let i = 1; i <= count; i++) {

      const residenceId = (1000 * Math.ceil(i / 25)) +
        (100 * Math.ceil(i / 5)) +
        (i - (5 * Math.floor((i - 1) / 5)))

      await contract.addResident(accounts[i - 1].address, residenceId);
    }
  }

  async function deployFixture() {

    // Contracts are deployed using the first signer/account by default
    const accounts = await hre.ethers.getSigners();
    const manager = accounts[0];

    const Condominium = await hre.ethers.getContractFactory("Condominium");
    const contract = await Condominium.deploy();

    return { contract, manager, accounts };
  }

  it("Should be residence", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    expect(await contract.residenceExists(2102)).to.equal(true);

  });

  it("Should add resident", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    expect(await contract.isResident(accounts[1].address)).to.equal(true);

  });

  it("Should not add resident (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    const instance = contract.connect(accounts[1]);

    await expect(instance.addResident(accounts[1].address, 2102)).to.revertedWith("Only the manager or the council can do this");
  });

  it("Should add resident (residence)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.addResident(accounts[1].address, 21020)).to.revertedWith("This residence does not exist");

  });


  it("Should remove resident", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.removeResident(accounts[1].address);

    expect(await contract.isResident(accounts[1].address)).to.equal(false);
  });


  it("Should NOT remove resident (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);

    await expect(instance.removeResident(accounts[1].address)).to.be.revertedWith("Only the manager can do this")
  });


  it("Should NOT remove resident (counselour)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    await expect(contract.removeResident(accounts[1].address)).to.be.revertedWith("A counselor cannot be removed")
  });


  it("Should set Counselor", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    const instance = contract.connect(accounts[1]);
    await instance.addResident(accounts[2].address, 2103);

    expect(await contract.counselors(accounts[1].address)).to.equal(true);
    expect(await contract.isResident(accounts[2].address)).to.equal(true);
  });

  it("Should set Counselor (false)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.setCounselor(accounts[1].address, true);

    await contract.setCounselor(accounts[1].address, false);

    expect(await contract.counselors(accounts[1])).to.equal(false);
  
  });


  it("Should not set Counselor (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);

    await expect(instance.setCounselor(accounts[1].address, true)).to.be.revertedWith("Only the manager can do this");
  });

  it("Should not set Counselor (resident)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.setCounselor(accounts[1].address, true)).to.be.revertedWith("The counselor must be a resident");
  });

  it("change manager", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.CHANGE_MANAGER, 0, accounts[1].address);
    await contract.openVoting('topic');

    await contract.vote('topic', Options.YES);

    await addResidents(contract, 15, accounts);
    await addVotes(contract, 15, accounts, 'topic');

    await contract.closeVoting('topic');

    expect(await contract.manager()).to.equal(accounts[1].address);
  });

  it("change quota", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    const newQuotaValue = ethers.parseEther("0.02");
    await contract.addTopic("topic", "description 1", Category.CHANGE_QUOTA, newQuotaValue, manager.address);
    await contract.openVoting('topic');

    await contract.vote('topic', Options.YES);

    await addResidents(contract, 20, accounts);
    await addVotes(contract, 20, accounts, 'topic');

    await contract.closeVoting('topic');

    expect(await contract.montlyQuota()).to.equal(newQuotaValue);
  });

  it("Should add topic (manager)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

    expect(await contract.topicExists("topic 1")).to.equal(true);

  });

  it("Should NOT add topic (amount)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    expect(contract.addTopic("topic 1", "description 1", Category.DECISION, 10, manager.address)).to.be.revertedWith('Wrong category');

  });

  it("Should add topic (resident)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);

    await instance.addTopic("topic 1", "description 1", Category.DECISION, 0, accounts[1].address);

    expect(await contract.topicExists("topic 1")).to.equal(true);

  });


  it("Should NOT add topic (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    const instance = contract.connect(accounts[1]);

    await expect(instance.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address)).to.be.revertedWith('Only the manager or residents can do this');

  });

  it("Should NOT add topic (duplication)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

    await expect(contract.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address)).to.be.revertedWith('This topic already exists');

  });

  it("Should remove topic", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.removeTopic("topic");

    expect(await contract.topicExists("topic")).to.equal(false);
  });

  it("Should NOT remove topic (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    const instance = contract.connect(accounts[1]);

    await expect(instance.removeTopic("topic")).to.be.revertedWith('Only the manager can do this');
  });

  it("Should NOT remove topic (not exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.removeTopic("topic 1")).to.be.revertedWith('The topic does not exists');
  });


  it("Should NOT remove topic (status)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic STATUS", "description 1", Category.DECISION, 0, manager.address);

    await contract.openVoting('topic STATUS');

    await expect(contract.removeTopic("topic STATUS")).to.be.revertedWith('Only IDLE topics can be removed');
  });

  it("Should vote", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.openVoting('topic');

    await addResidents(contract, 5, accounts);
    await addVotes(contract, 5, accounts, 'topic', Options.ABSTENTION);
    await contract.closeVoting('topic');

    expect(await contract.numbersOfVotes('topic')).to.equal(5);

  });

  it("Should not vote (duplicated)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.openVoting('topic');

    const instance = contract.connect(accounts[1]);

    await instance.vote('topic', Options.YES)
    await expect(instance.vote('topic', Options.YES)).to.be.revertedWith('A residence should vote only once');

  });

  it("Should not vote (STATUS)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);

    const instance = contract.connect(accounts[1]);

    await expect(instance.vote('topic', Options.YES)).to.be.revertedWith('Only VOTING topics can be voted');

  });

  it("Should not vote (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    const instance = contract.connect(accounts[1]);

    await expect(instance.vote('topic', Options.YES)).to.be.revertedWith('The topic does not exists');

  });


  it("Should not vote (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.openVoting('topic');

    const instance = contract.connect(accounts[1]);

    await expect(instance.vote('topic', Options.YES)).to.be.revertedWith('Only the manager or residents can do this')

  });

  it("Should NOT vote (empty)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.openVoting('topic');

    const instance = contract.connect(accounts[1]);

    await expect(instance.vote('topic', Options.EMPTY)).to.be.revertedWith('The option cannot be EMPTY');

  });


  it("Should close voting", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.openVoting('topic');

    await contract.vote('topic', Options.YES);

    await addResidents(contract, 5, accounts);
    await addVotes(contract, 5, accounts, 'topic', Options.NO);

    await contract.closeVoting('topic');

    const topic = await contract.getTopic('topic');

    expect(topic.status).to.equal(Status.DENIED);

  });


  it("Should NOT close voting (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.openVoting('topic');

    const instance = contract.connect(accounts[1]);

    await expect(instance.closeVoting('topic')).to.revertedWith('Only the manager can do this');

  });

  it("Should NOT close voting (exists)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await expect(contract.closeVoting('topic')).to.revertedWith('The topic does not exists');

  });

  it("Should NOT close voting (status)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);

    await expect(contract.closeVoting('topic')).to.be.revertedWith('Only VOTING topics can be closed');

  });

  it("Should NOT close voting (minimum votes)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);
    await contract.openVoting('topic');

    await expect(contract.closeVoting('topic')).to.be.revertedWith('You cannot finish a voting without the minimum votes');

  });

  it("Should NOT open voting (permission)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addResident(accounts[1].address, 2102);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);

    const instance = contract.connect(accounts[1]);


    await expect(instance.openVoting('Only the manager can do this')).to.revertedWith('Only the manager can do this');

  });

  it("Should NOT open voting (STATUS)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    await contract.addTopic("topic", "description 1", Category.DECISION, 0, manager.address);

    await contract.openVoting('topic');

    await expect(contract.openVoting('topic')).to.revertedWith('Only IDLE topics can be open for voting');

  });

  it("Should NOT open voting (NOT EXISTS)", async function () {
    const { contract, manager, accounts } = await loadFixture(deployFixture);

    
    await expect(contract.openVoting('topic')).to.revertedWith('The topic does not exists');

  });

});
