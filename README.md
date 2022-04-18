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


## Optimistic Testnet Configuration
Network Name: Optimism Kovan
WebSite:  https://optimism.io
ChainID:   69
NetworkID:   69
Symbol:   ETH
Optimism Kovan(ETH) faucet
http://fauceth.komputing.orgchain69address{ADDRESS}
https://faucet.paradigm.xyz/
https://kovan.optifaucet.com/
Optimism Kovan(ETH) Blockchain Explorer
https://kovan-optimistic.etherscan.io
Optimism Kovan(ETH) RPC
https://kovan.optimism.io/