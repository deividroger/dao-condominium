// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import './options.sol';

struct Vote {
        address resident;
        uint16 residence;
        Options option;
        uint256 timestamp;

    }