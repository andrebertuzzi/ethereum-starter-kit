const { Contract, Wallet, BigNumber, constants, providers } = require('ethers')
const { parseUnits, formatEther, formatUnits } = require('ethers/lib/utils')
const fetch = require('node-fetch')
const hre = require('hardhat')
require('dotenv').config({ path: '../.env' })

async function main() {
  const ClearingHouseArtifact = require('@perp/curie-contract/artifacts/contracts/ClearingHouse.sol/ClearingHouse.json')
  const ExchangeArtifact = require('@perp/curie-contract/artifacts/contracts/Exchange.sol/Exchange.json')


  const urlStag = 'https://metadata.perp.exchange/v2/optimism-kovan.json'
  const urlProd = 'https://metadata.perp.exchange/v2/optimism.json'

  const metadata = await fetch(urlStag).then((res) => res.json())

  const clearingHouseAddr = metadata.contracts.ClearingHouse.address
  const exchangeAddr = metadata.contracts.Exchange.address

  const mainNet = 'https://mainnet.optimism.io'
  const testNet = 'https://kovan.optimism.io'
  const layer2Provider = new providers.JsonRpcProvider(testNet)
  const layer2Wallet = new Wallet(process.env.PRIVATE_KEY).connect(layer2Provider)

  let clearingHouse = new Contract(
    clearingHouseAddr,
    ClearingHouseArtifact.abi,
    layer2Wallet
  )

  let exchange = new Contract(
    exchangeAddr,
    ExchangeArtifact.abi,
    layer2Provider
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
