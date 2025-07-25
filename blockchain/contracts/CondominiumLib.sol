// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library CondominiumLib {
    enum Status {
        IDLE,
        VOTING,
        APPROVED,
        DENIED,
        DELETED,
        SPENT
    }
    struct Topic {
        string title;
        string description;
        Category category;
        Status status;
        uint256 createdDate;
        uint256 startDate;
        uint256 endDate;
        uint amount;
        address responsible;
    }

    enum Options {
        EMPTY,
        YES,
        NO,
        ABSTENTION
    }

    enum Category {
        DECISION,
        SPENT,
        CHANGE_QUOTA,
        CHANGE_MANAGER
    }

    struct Vote {
        address resident;
        uint16 residence;
        Options option;
        uint256 timestamp;
    }
    struct TopicUpdate {
        bytes32 id;
        string title;
        Status status;
        Category category;

    }

    struct TransferReceipt {
        address to;
        uint amount;
        string topic;
    } 
}
