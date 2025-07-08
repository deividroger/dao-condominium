// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./topics/Status.sol";
import "./topics/Topic.sol";
import './voting/vote.sol';
import './voting/options.sol';

contract Condominium {


    address public manager;
    
    mapping (uint16 => bool) residences; //unidades

    mapping (address => uint16) residents; // wallet

    mapping (address => bool) public counselors; //conselheiros

    mapping(bytes32 => Topic ) public topics;

    mapping (bytes32 => Vote[]) votings;
    
    constructor() {
        manager = msg.sender;

        for (uint8 i = 1; i <= 2; i++) { //blocos
            for (uint8 j = 1; j <= 5; j++) { //andares
                for (uint8 k = 1; k <= 5; k++) { //unidades
                    unchecked{
                        residences[uint16(i * 1000 + (j * 100) + k)] = true;
                    }
                }
            }
        }
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only the manager can do this");
        _;
    }
    modifier onlyCounsil() {
        require(msg.sender == manager || counselors[msg.sender], "Only the manager or the council can do this");
        _;
    }
    modifier onlyResident() {
        require(msg.sender == manager || isResident(msg.sender), "Only the manager or residents can do this");
        _;
    }

    function residenceExists(uint16 residenceId) public view returns (bool) {
        return residences[residenceId];
    }

    function isResident(address resident) public view  returns (bool) {
        return residents[resident] > 0;   
    }

    function addResident(address resident, uint16 residenceId) external onlyCounsil {
        require(residenceExists(residenceId),"This residence does not exist");

        residents[resident] = residenceId;
    }

    function removeResident(address resident) external onlyManager {
        require(!counselors[resident],"A counselor cannot be removed");

        delete residents[resident];

        if(counselors[resident]){
            delete counselors[resident];
        }
    }

    function setCounselor(address resident, bool isEntering) external onlyManager {
        
        if(isEntering){
            require(isResident(resident),"The counselor must be a resident");
            counselors[resident] = true;
        }else {
           delete counselors[resident];
        }
    }


    function setManager(address newManager) external onlyManager {
        require(newManager != address(0), "The address must be valid");
        manager = newManager;
    }

    function getTopic(string memory title) public view returns (Topic memory){
        bytes32 topicId = keccak256(bytes(title));
        return topics[topicId];
    }

    function topicExists(string memory title) public view returns (bool) {
        return getTopic(title).createdDate > 0;
    }

    function addTopic(string memory title, string memory description) external onlyResident{
        require(!topicExists(title),"This topic already exists");
        
        Topic memory newTopic = Topic({
           title: title,
           description: description,
           createdDate:  block.timestamp,
           startDate: 0,
           endDate: 0,
           status: Status.IDLE
        });
        
        topics[keccak256(bytes(title))] = newTopic;
    }

    function removeTopic(string memory title) external onlyManager {
        Topic memory topic = getTopic(title);
        require(topic.createdDate > 0, "The topic does not exists");
        require(topic.status == Status.IDLE, "Only IDLE topics can be removed");
        
        delete topics[keccak256(bytes(title))];
    }

    function openVoting(string memory title) external onlyManager {
        Topic memory topic = getTopic(title);
        require(topic.createdDate > 0,"The topic does not exists");
        require(topic.status == Status.IDLE, "Only IDLE topics can be open for voting");

        bytes32 topicId= keccak256(bytes(title));
        topics[topicId].status = Status.VOTING;
        topics[topicId].startDate = block.timestamp;
    }

    function vote(string memory title, Options option) external onlyResident {
        require(option != Options.EMPTY,"The option cannot be EMPTY");
        Topic memory topic = getTopic(title);
        require(topic.createdDate > 0,"The topic does not exists");
        require(topic.status == Status.VOTING, "Only VOTING topics can be voted");
        
        bytes32 topicId = keccak256(bytes(title));

        uint16 residence = residents[msg.sender];

        Vote[] memory votes = votings[topicId];

        for (uint8 i = 0; i < votes.length; i++) {
            if (votes[i].residence == residence) {
                require(false, "A residence should vote only once");
            }
        }

        Vote memory newVote = Vote({
            residence: residence,
            resident: msg.sender,
            option: option,
            timestamp: block.timestamp

        });

        votings[topicId].push(newVote);

    }

    function closeVoting(string memory title) external onlyManager {
        Topic memory topic = getTopic(title);
        require(topic.createdDate > 0,"The topic does not exists");
        require(topic.status == Status.VOTING, "Only VOTING topics can be closed");

        uint8 approved = 0;
        uint8 denied = 0;
        uint8 abstentions = 0;

        bytes32 topicId= keccak256(bytes(title));

        Vote[] memory votes =  votings[topicId];

          for (uint8 i = 0; i < votes.length; i++) {
            if (votes[i].option == Options.YES) {
                approved++;
            }

            if (votes[i].option == Options.NO) {
                denied++;
            }

            if (votes[i].option == Options.ABSTENTION) {
                abstentions++;
            }
        }  

        if (approved > denied) {
            topics[topicId].status = Status.APPROVED;
        }else {
            topics[topicId].status = Status.DENIED;
        }

        topics[topicId].endDate = block.timestamp;
    }

    function numbersOfVotes(string memory title) external view returns(uint256){
        bytes32 topicId= keccak256(bytes(title));

        return votings[topicId].length;
    }
}