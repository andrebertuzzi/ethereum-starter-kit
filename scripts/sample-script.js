const { Contract, Wallet, BigNumber, constants, providers } = require('ethers')
const { parseUnits, formatEther, formatUnits } = require('ethers/lib/utils')
const fetch = require('node-fetch')
const hre = require('hardhat')
require('dotenv').config({ path: '../.env' })

async function main() {
  const ClearingHouseArtifact = require('@perp/curie-contract/artifacts/contracts/ClearingHouse.sol/ClearingHouse.json')

  const url = 'https://metadata.perp.exchange/v2/optimism-kovan.json'
  const metadata = await fetch(url).then((res) => res.json())
  const clearingHouseAddr = metadata.contracts.ClearingHouse.address

  const kovan = 'https://kovan.optimism.io'
  const layer2Provider = new providers.JsonRpcProvider(kovan)
  const layer2Wallet = new Wallet(process.env.PRIVATE_KEY).connect(layer2Provider)

  let clearingHouse = new Contract(
    clearingHouseAddr,
    ClearingHouseArtifact.abi,
    layer2Wallet
  )

  await clearingHouse.getAccountValue(process.env.PUBLIC_KEY)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
