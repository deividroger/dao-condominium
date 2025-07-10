import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import hre from "hardhat";
import { Options } from './shared/Options';
import { Status } from './shared/status';

describe("CondominiumAdapter", function () {


    async function deployAdapterFixture() {

        // Contracts are deployed using the first signer/account by default
        const accounts = await hre.ethers.getSigners();
        const manager = accounts[0];

        const condominiumAdapter = await hre.ethers.getContractFactory("CondominiumAdapter");
        const adapter = await condominiumAdapter.deploy();

        return { adapter, manager, accounts };
    }

    async function deployImplementationFixture() {

        const condominium = await hre.ethers.getContractFactory("Condominium");
        const contract = await condominium.deploy();

        return { contract };
    }

    it("Should upgrade", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);
        const address = await adapter.getImplAddress();

        expect(address).to.equal(contractAddress);

    });

    it("Should NOT upgrade (permission)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const instance = adapter.connect(accounts[1]);
        const contractAddress = await contract.getAddress();

        await expect(instance.upgrade(contractAddress)).to.be.revertedWith("You do not have permission");

    });


    it("Should add resident", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addResident(accounts[1].address, 1301);

        expect(await contract.isResident(accounts[1].address)).to.equal(true);

    });

    it("Should remove resident", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addResident(accounts[1].address, 1301);
        await adapter.removeResident(accounts[1].address);

        expect(await contract.isResident(accounts[1].address)).to.equal(false);

    });

    it("Should set couselor", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addResident(accounts[1].address, 1301);

        await adapter.setCounselor(accounts[1].address, true);

        expect(await contract.counselors(accounts[1].address)).to.equal(true);

    });

    it("Should add topic", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1");

        expect(await contract.topicExists("topic 1")).to.equal(true);

    });

    it("Should remove topic", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1");

        await adapter.removeTopic("topic 1");

        expect(await contract.topicExists("topic 1")).to.equal(false);

    });


    it("Should open voting", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1");

        await adapter.openVoting("topic 1");

        const topic = await contract.getTopic('topic 1');

        expect(topic.status).to.equal(Status.VOTING);

    });

    it("Should open voting", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1");

        await adapter.openVoting("topic 1");

        const topic = await contract.getTopic('topic 1');

        expect(topic.status).to.equal(Status.VOTING);

    });

    it("Should open VOTE", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1");

        await adapter.openVoting("topic 1");

        await adapter.addResident(accounts[1].address, 1301);
        const instance = adapter.connect(accounts[1]);

        await instance.vote('topic 1', Options.YES);

        expect(await contract.numbersOfVotes("topic 1")).to.equal(1);

    });

    it("Should close voting", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1");

        await adapter.openVoting("topic 1");

        await adapter.addResident(accounts[1].address, 1301);
        const instance = adapter.connect(accounts[1]);

        await instance.vote('topic 1', Options.YES);

        await adapter.closeVoting("topic 1");

        const topic = await contract.getTopic("topic 1");

        expect(topic.status).to.equal(Status.APPROVED);

    });
});
