// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./Status.sol";

    struct Topic {
        string title;
        string description;
        Status status;
        uint256 createdDate;
        uint256 startDate;
        uint256 endDate;
    }