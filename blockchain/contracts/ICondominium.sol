// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {CondominiumLib as Lib} from "./CondominiumLib.sol";

interface ICondominium {
    function addResident(address resident, uint16 residenceId) external;

    function removeResident(address resident) external;

    function setCounselor(address resident, bool isEntering) external;

    function addTopic(
        string memory title,
        string memory description,
        Lib.Category category,
        uint amount,
        address responsible
    ) external;

    function editTopic(
        string memory topicToEdit,
        string memory description,
        uint amount,
        address responsible
    ) external returns (Lib.TopicUpdate memory);

    function removeTopic(
        string memory title
    ) external returns (Lib.TopicUpdate memory);

    function openVoting(
        string memory title
    ) external returns (Lib.TopicUpdate memory);

    function vote(string memory title, Lib.Options option) external;

    function closeVoting(
        string memory title
    ) external returns (Lib.TopicUpdate memory);

    function payQuota(uint16 residenseId) external payable;

    function transfer(
        string memory topicTitle,
        uint amount
    ) external returns (Lib.TransferReceipt memory);

    function getManager() external view returns (address);

    function getQuota() external view returns (uint);
}
