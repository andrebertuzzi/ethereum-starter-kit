# ethereum-starter-kit

Setup for running commands on Ethereum blockchain and writing Solidity contracts:

Hardhat, Ethers, Chai, Solhint, Solcover and Prettier

# COMMANDS

## console
npx hardhat console

## runs node
npx hardhat node

## compile contracts
npx hardhat compile

## deploy contract in the node
npx hardhat run scripts/deploy.js --network localhost

## Coverage
npx hardhat coverage [command-options]

## solhint
solhint --init

solhint 'contracts/**/*.sol'

## Prettier
npx prettier --write 'contracts/**/*.sol'
