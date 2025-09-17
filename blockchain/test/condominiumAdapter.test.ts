import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Options } from './shared/Options';
import { Status } from './shared/status';
import { Category } from "./shared/category";
import { CondominiumAdapter } from "../typechain-types";

describe("CondominiumAdapter", function () {

    async function addVotes(adapter: CondominiumAdapter, count: number, accounts: SignerWithAddress[], topicName: string, option: Options = Options.YES) {
        for (let i = 1; i <= count; i++) {
            const instance = adapter.connect(accounts[i - 1]);
            await instance.vote(topicName, option);

        }
    }

    async function addResidents(adapter: CondominiumAdapter, count: number, accounts: SignerWithAddress[]) {
        for (let i = 1; i <= count; i++) {

            const residenceId = (1000 * Math.ceil(i / 25)) +
                (100 * Math.ceil(i / 5)) +
                (i - (5 * Math.floor((i - 1) / 5)))

            await addResidentPayingQuota(adapter, accounts[i - 1], residenceId);
        }
    }
    async function addResidentPayingQuota(adapter: CondominiumAdapter, account: SignerWithAddress, residenceId: number) {
        await adapter.addResident(account.address, residenceId);
        const instance = adapter.connect(account);
        await instance.payQuota(residenceId, { value: ethers.parseEther("0.01") });
    }

    async function deployAdapterFixture() {

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

    it("Should NOT upgrade (address)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.upgrade(ethers.ZeroAddress)).to.be.revertedWith("Invald address");

    });

    it("Should add resident", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addResident(accounts[1].address, 1301);

        expect(await contract.isResident(accounts[1].address)).to.equal(true);

    });

    it("Should NOT add resident(not upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.addResident(accounts[1].address, 1301)).to.be.revertedWith("You must upgrade first");

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

    it("Should not remove resident (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.removeResident(accounts[1].address)).to.be.revertedWith("You must upgrade first");

    });

    it("Should set couselor", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addResident(accounts[1].address, 1301);

        await adapter.setCounselor(accounts[1].address, true);

        const resident = await adapter.getResident(accounts[1].address);
        expect(resident.isCounselour).to.equal(true);
    });

    it("Should not set couselor (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.setCounselor(accounts[1].address, true)).to.revertedWith("You must upgrade first");

    });

    it("Should add topic", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        expect(await contract.topicExists("topic 1")).to.equal(true);

    });

    it("Should NOT add topic (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address)).to.revertedWith("You must upgrade first");

    });

    it("Should edit topic", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.SPENT, 0, manager.address);

        await adapter.editTopic("topic 1", "new description", 2, manager.address);

        const topic = await contract.getTopic("topic 1");

        expect(topic.description).to.equal("new description");

    });

    it("Should NOT edit topic (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.editTopic("topic 1", "new description", 2, manager.address)).to.be.revertedWith("You must upgrade first");

    });

    it("Should remove topic", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        await adapter.removeTopic("topic 1");

        expect(await contract.topicExists("topic 1")).to.equal(false);

    });

    it("Should remove topic (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.removeTopic("topic 1")).to.be.rejectedWith("You must upgrade first");

    });

    it("Should open voting", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        await adapter.openVoting("topic 1");

        const topic = await contract.getTopic('topic 1');

        expect(topic.status).to.equal(Status.VOTING);

    });


    it("Should NOT open voting (UPGRADE)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.openVoting("topic 1")).to.be.revertedWith("You must upgrade first");

    });


    it("Should open VOTE", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        await adapter.openVoting("topic 1");

        await addResidentPayingQuota(adapter, accounts[1], 1301);
        const instance = adapter.connect(accounts[1]);

        await instance.vote('topic 1', Options.YES);

        expect(await contract.numbersOfVotes("topic 1")).to.equal(1);

    });

    it("Should NOT VOTE (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.vote("topic 1", Options.EMPTY)).to.be.revertedWith("You must upgrade first");

    });


    it("Should NOT open VOTE (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.openVoting("topic 1")).to.be.revertedWith("You must upgrade first");

    });

    it("Should close voting (decision approved)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        await adapter.openVoting("topic 1");

        await addResidents(adapter, 5, accounts);

        await addVotes(adapter, 5, accounts, "topic 1");

        await expect(adapter.closeVoting("topic 1")).to.emit(adapter, "TopicChanged");

        const topic = await contract.getTopic("topic 1");
        expect(topic.status).to.equal(Status.APPROVED);

    });

    it("Should close voting (decision denied)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        await adapter.openVoting("topic 1");

        await addResidents(adapter, 5, accounts);

        await addVotes(adapter, 5, accounts, "topic 1", Options.NO);

        await expect(adapter.closeVoting("topic 1")).to.emit(adapter, "TopicChanged");
        const topic = await contract.getTopic("topic 1");
        expect(topic.status).to.equal(Status.DENIED);

    });

    it("Should NOT close voting (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.closeVoting("topic 1")).to.be.revertedWith("You must upgrade first");

    });

    it("Should NOT payQuota (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);

        await expect(adapter.payQuota(1022, { value: ethers.parseEther("0.02") })).to.be.revertedWith("You must upgrade first");

    });

    it("Should transfer", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.SPENT, 100, accounts[1].address);

        await adapter.openVoting("topic 1");

        await addResidents(adapter, 10, accounts);

        await addVotes(adapter, 10, accounts, "topic 1");

        await adapter.closeVoting("topic 1");

        const balanceBefore = await ethers.provider.getBalance(contractAddress);

        const balanceWorkerBefore = await ethers.provider.getBalance(accounts[1].address);

        await adapter.transfer("topic 1", 100);

        const balanceAfter = await ethers.provider.getBalance(contractAddress);
        const balanceWorkerAfer = await ethers.provider.getBalance(accounts[1].address);

        const topic = await contract.getTopic("topic 1");

        expect(balanceAfter).to.equal(balanceBefore - 100n);
        expect(balanceWorkerAfer).to.equal(balanceWorkerBefore + 100n);

        expect(topic.status).to.equal(Status.SPENT);

    });

    it("Should NOT transfer (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        await expect(adapter.transfer("topic 1", 100)).to.be.revertedWith("You must upgrade first");
    });


    it("Should close voting (change_manager)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.CHANGE_MANAGER, 0, accounts[1].address);

        await adapter.openVoting("topic 1");

        await addResidents(adapter, 15, accounts);

        await addVotes(adapter, 15, accounts, "topic 1");

        await expect(adapter.closeVoting("topic 1")).to.emit(adapter, "ManagerChanged").withArgs(accounts[1].address);
    });

    it("Should close voting (quota_changed)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.CHANGE_QUOTA, 100, manager.address);

        await adapter.openVoting("topic 1");

        await addResidents(adapter, 20, accounts);

        await addVotes(adapter, 20, accounts, "topic 1");

        await expect(adapter.closeVoting("topic 1")).to.emit(adapter, "QuotaChanged").withArgs(100);
    });

    it("Should get manager", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        const currentManager = await adapter.getManager();

        expect(currentManager).to.equal(manager.address);
    });

    it("Should NOT get manager (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        await expect(adapter.getManager()).to.be.revertedWith("You must upgrade first");
    });

    it("Should get quota", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        const currentQuota = await adapter.getQuota();

        expect(currentQuota).to.equal(await contract.getQuota());
    });

    it("Should NOT get quota (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        await expect(adapter.getQuota()).to.be.revertedWith("You must upgrade first");
    });

    it("Should get residents", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();
        await adapter.upgrade(contractAddress);

        await adapter.addResident(accounts[1].address, 1301);

        const result = await adapter.getResidents(1, 10);

        expect(result.residents[0][0]).to.equal(accounts[1].address);

    });

    it("should NOT get residents(upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        await (expect(adapter.getResidents(1, 10))).to.be.revertedWith("You must upgrade first");
    });

    it("should NOT get resident (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        await (expect(adapter.getResident(ethers.ZeroAddress))).to.be.revertedWith("You must upgrade first");
    });

    it("should get topic", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();
        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        const topic = await adapter.getTopic("topic 1");

        expect(topic.title).to.equal("topic 1");
    });

    it("should NOT get topic (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        await expect(adapter.getTopic("topic 1")).to.be.revertedWith("You must upgrade first");
    });

    it("Should get topics", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();
        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        const result = await adapter.getTopics(1, 10);

        expect(result.topics[0].title).to.equal("topic 1");

    });

    it("should NOT get topics (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        await expect(adapter.getTopics(1, 10)).to.be.revertedWith("You must upgrade first");
    });

    it("Should get votes", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        const { contract } = await loadFixture(deployImplementationFixture);

        const contractAddress = await contract.getAddress();

        await adapter.upgrade(contractAddress);

        await adapter.addTopic("topic 1", "description 1", Category.DECISION, 0, manager.address);

        await adapter.openVoting("topic 1");

        await addResidentPayingQuota(adapter, accounts[1], 1301);
        const instance = adapter.connect(accounts[1]);

        await instance.vote('topic 1', Options.YES);

        const votes = await adapter.getVotes('topic 1');

        expect(votes[0].option).to.equals(Options.YES);

    });
    it("should NOT get votes (upgrade)", async function () {
        const { adapter, manager, accounts } = await loadFixture(deployAdapterFixture);
        await expect(adapter.getVotes('topic 1')).to.be.revertedWith("You must upgrade first");
    });

});
