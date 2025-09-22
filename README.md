# DAO Condominium

DAO Condominium is a decentralized platform for condominium management using smart contracts and decentralized applications (DApps). This project demonstrates a secure and transparent approach for managing shared residential spaces.

## Repository Structure

### Blockchain (`/blockchain`)
Contains the smart contracts and scripts to deploy and test the decentralized governance system:

- `contracts/`: Solidity contracts for condominium management (e.g., resident registration, fee tracking, voting).
- `scripts/`: Deployment scripts to initialize contracts on a local or test blockchain.
- `test/`: Automated tests for validating smart contract logic.
- `hardhat.config.js`: Configuration for Hardhat development environment.

### Frontend DApp (`/dapp`)
Frontend application that interacts with the smart contracts:

- `src/`: Main source code for the DApp.
  - `components/`: Reusable UI components.
  - `pages/`: Pages for navigation (e.g., dashboard, resident management, voting panel).
  - `services/`: Blockchain interaction services using Ethers.js.
- `vite.config.js`: Vite configuration for building and serving the DApp.
- `package.json`: Project dependencies and scripts.

## Features

- Resident registration and management.
- Fee tracking and payment verification.
- Voting system for condominium decisions.
- Dashboard to monitor building data.
- Interaction with Ethereum-compatible blockchains via Metamask.

## Technologies Used

- **Solidity**: Smart contract development.
- **Hardhat**: Ethereum development environment.
- **Ethers.js**: Blockchain interaction library.
- **React + Vite**: Frontend framework and build tool.
- **SCSS/CSS**: Styling for UI components.
- **Node.js & npm**: Package management and scripts execution.

## Installation

Clone the repository:

```bash
git clone https://github.com/deividroger/dao-condominium.git
cd dao-condominium
