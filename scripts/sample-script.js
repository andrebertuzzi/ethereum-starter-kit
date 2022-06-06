const { Contract, Wallet, BigNumber, constants, providers } = require('ethers')
const { parseUnits, formatEther, formatUnits } = require('ethers/lib/utils')
const fetch = require('node-fetch')
const hre = require('hardhat')
require('dotenv').config({ path: '../.env' })


const DEFAULT_DECIMALS = 18

const deposit = async () => {
  const options = {
    gasLimit: 3_000_000,
  }

  // Need allowance first
  const tx = await vault.deposit(usdcAddr, parseUnits('90'), options)
  const result = await tx.wait()
  console.log(result)

}



async function main() {
  const ClearingHouseArtifact = require('@perp/curie-contract/artifacts/contracts/ClearingHouse.sol/ClearingHouse.json')
  const ExchangeArtifact = require('@perp/curie-contract/artifacts/contracts/Exchange.sol/Exchange.json')
  const VaultArtifact = require('@perp/curie-contract/artifacts/contracts/Vault.sol/Vault.json')

  const urlStag = 'https://metadata.perp.exchange/v2/optimism-kovan.json'
  const urlProd = 'https://metadata.perp.exchange/v2/optimism.json'

  const metadata = await fetch(urlProd).then((res) => res.json())

  const clearingHouseAddr = metadata.contracts.ClearingHouse.address
  const exchangeAddr = metadata.contracts.Exchange.address
  const vaultAddr = metadata.contracts.Vault.address
  const usdcAddr = metadata.externalContracts.USDC

  const mainNet = 'https://mainnet.optimism.io'
  const testNet = 'https://kovan.optimism.io'
  const layer2Provider = new providers.JsonRpcProvider(mainNet)
  const layer2Wallet = new Wallet(process.env.PRIVATE_KEY).connect(layer2Provider)

  let clearingHouse = new Contract(
    clearingHouseAddr,
    ClearingHouseArtifact.abi,
    layer2Wallet
  )

  let exchange = new Contract(
    exchangeAddr,
    ExchangeArtifact.abi,
    layer2Wallet
  )

  let vault = new Contract(
    vaultAddr,
    VaultArtifact.abi,
    layer2Wallet
  )

  
  const value = await clearingHouse.getAccountValue(process.env.PUBLIC_KEY)
  console.log(formatEther(value.toString()))

  const VETH_ADDR = metadata.contracts.vETH.address

  const block = await layer2Provider.getBlock()

  const quoteAssetAmount = {
    d: parseUnits(0.01.toString(), DEFAULT_DECIMALS),
  }

  const params = {
    baseToken: VETH_ADDR,
    isBaseToQuote: false, // false for longing
    isExactInput: false,
    amount: parseUnits(0.01.toString()),
    oppositeAmountBound: 0, // 0 for no amount limit
    sqrtPriceLimitX96: 0, // 0 for no price limit
    deadline: block.timestamp + 900, // 15 minutes for example
    referralCode: 0x0000000000000000000000000000000000000000000000000000000000000000 // zero for example
  }

  const result = await clearingHouse.openPosition(params)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
