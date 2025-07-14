// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ICondominium.sol";

contract CondominiumAdapter {
    ICondominium private implementation;
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    modifier updgraded() {
        require(
            address(implementation) != address(0),
            "You must upgrade first"
        );
        _;
    }

    function getImplAddress() external view returns (address) {
        return address(implementation);
    }

    function upgrade(address newImplementation) external {
        require(msg.sender == owner, "You do not have permission");
        require(newImplementation != address(0), "Invald address");
        implementation = ICondominium(newImplementation);
    }

    function addResident(
        address resident,
        uint16 residenceId
    ) external updgraded {
        return implementation.addResident(resident, residenceId);
    }

    function removeResident(address resident) external updgraded {
        return implementation.removeResident(resident);
    }

    function setCounselor(
        address resident,
        bool isEntering
    ) external updgraded {
        return implementation.setCounselor(resident, isEntering);
    }

    function addTopic(
        string memory title,
        string memory description,
        Lib.Category category,
        uint amount,
        address responsible
    ) external updgraded {
        return
            implementation.addTopic(
                title,
                description,
                category,
                amount,
                responsible
            );
    }

    function editTopic(
        string memory topicToEdit,
        string memory description,
        uint amount,
        address responsible
    ) external updgraded {
        return
            implementation.editTopic(
                topicToEdit,
                description,
                amount,
                responsible
            );
    }

    function removeTopic(string memory title) external updgraded {
        return implementation.removeTopic(title);
    }

    function openVoting(string memory title) external updgraded {
        return implementation.openVoting(title);
    }

    function vote(string memory title, Lib.Options option) external updgraded {
        return implementation.vote(title, option);
    }

    function closeVoting(string memory title) external updgraded {
        return implementation.closeVoting(title);
    }

    function payQuota(uint16 residenseId) external payable updgraded {
        return implementation.payQuota{value: msg.value}(residenseId);
    }
}
