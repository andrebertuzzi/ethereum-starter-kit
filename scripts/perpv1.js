// require('dotenv').config()
const { Contract, Wallet, BigNumber, constants, providers } = require('ethers')
const { parseUnits, formatEther, formatUnits } = require('ethers/lib/utils')
const fetch = require('node-fetch')
require('dotenv').config({ path: '../.env' })

const LEVERAGE = 3
const DEFAULT_DECIMALS = 18
const PNL_OPTION_SPOT_PRICE = 0

let contracts = {},
  clearingHouse,
  layer2Wallet,
  layer2Usdc,
  clearingHouseViewer


async function setupEnv() {
  const key = process.env.PRIVATE_KEY
  // const contracts = {}
  const url = 'https://metadata.perp.exchange/production.json'
  const metadata = await fetch(url).then((res) => res.json())

  const xDaiUrl = 'https://rpc.xdaichain.com'
  const layer2Provider = new providers.JsonRpcProvider(xDaiUrl)
  layer2Wallet = new Wallet(key).connect(layer2Provider)

  const AmmArtifact = require('@perp/contract/build/contracts/src/Amm.sol/Amm.json')
  const ClearingHouseArtifact = require('@perp/contract/build/contracts/src/ClearingHouse.sol/ClearingHouse.json')
  const TetherTokenArtifact = require('@perp/contract/build/contracts/TetherToken.json')
  const ClearingHouseViewerArtifact = require('@perp/contract/build/contracts/ClearingHouseViewer.json')
  const clearingHouseAddr =
    metadata.layers.layer2.contracts.ClearingHouse.address

  const xUsdcAddr = metadata.layers.layer2.externalContracts.usdc
  const chViewerAddr =
    metadata.layers.layer2.contracts.ClearingHouseViewer.address

  layer2Usdc = new Contract(xUsdcAddr, TetherTokenArtifact, layer2Wallet)

  assets.map((p) => {
    const ammAddr = metadata.layers.layer2.contracts[`${p}USDC`].address
    const amm = new Contract(ammAddr, AmmArtifact, layer2Wallet)
    contracts[p] = amm
  })

  clearingHouse = new Contract(
    clearingHouseAddr,
    ClearingHouseArtifact,
    layer2Wallet
  )
  clearingHouseViewer = new Contract(
    chViewerAddr,
    ClearingHouseViewerArtifact,
    layer2Wallet
  )

  return {
    contracts,
    clearingHouse,
    layer2Wallet,
    layer2Usdc,
    clearingHouseViewer,
  }
}

async function printBalances(layer2Wallet, layer2Usdc) {
  // get ETH & USDC balance
  // const ethBalance = await layer1Wallet.getBalance()
  const xDaiBalance = await layer2Wallet.getBalance()
  // let layer1UsdcBalance = await layer1Usdc.balanceOf(layer1Wallet.address)
  let layer2UsdcBalance = await layer2Usdc.balanceOf(layer2Wallet.address)
  // const layer1UsdcDecimals = await layer1Usdc.decimals()
  const layer2UsdcDecimals = await layer2Usdc.decimals()

  const outputs = [
    'balances',
    `- layer 2`,
    `  - ${formatEther(xDaiBalance)} xDAI`,
    `  - ${formatUnits(layer2UsdcBalance, layer2UsdcDecimals)} USDC`,
  ]
  console.log(outputs.join('\\n'))
}

async function printInfo(amm, wallet) {
  console.log('getting information')
  const position =
    await clearingHouseViewer.getPersonalPositionWithFundingPayment(
      amm.address,
      wallet.address
    )
  const pnl = await clearingHouseViewer.getUnrealizedPnl(
    amm.address,
    wallet.address,
    BigNumber.from(PNL_OPTION_SPOT_PRICE)
  )

  console.log(
    '- current position',
    formatUnits(position.size.d, DEFAULT_DECIMALS)
  )
  console.log(
    '- margin position',
    formatUnits(position.margin.d, DEFAULT_DECIMALS)
  )
  console.log('- pnl', formatUnits(pnl.d, DEFAULT_DECIMALS))
}

const openPosition = async (asset, amount, side) => {
  const price = await getSpotPrice(asset)
  const marginAmount = amount / LEVERAGE
  let minBase = (0.0).toFixed(9)
  // minBase = (0.998 * marginAmount/price).toFixed(10)
  const quoteAssetAmount = {
    d: parseUnits(marginAmount.toString(), DEFAULT_DECIMALS),
  }
  const leverage = { d: parseUnits(LEVERAGE.toString(), DEFAULT_DECIMALS) }
  const minBaseAssetAmount = { d: parseUnits(minBase), DEFAULT_DECIMALS } // "0" can be automatically converted
  // const options = { gasLimit: 3_000_000 }
  const options = {
    gasPrice: BigNumber.from('58000000000'),
    gasLimit: 3_000_000,
  } //18 Gwei

  const tx = await clearingHouse.openPosition(
    contracts[asset].address,
    side,
    quoteAssetAmount,
    leverage,
    minBaseAssetAmount,
    options
  )
  let result = await tx.wait()
  return result
}

const calcLeverage = async (asset) => {
  const key = await crypto.getSecret('BOT_SECRET')
  const {
    contracts,
    clearingHouse,
    layer2Wallet,
    layer2Usdc,
    clearingHouseViewer,
  } = await setupEnv(key)

  const amm = contracts[asset]

  const position =
    await clearingHouseViewer.getPersonalPositionWithFundingPayment(
      amm.address,
      layer2Wallet.address
    )

  const pnl = await clearingHouseViewer.getUnrealizedPnl(
    amm.address,
    layer2Wallet.address,
    BigNumber.from(PNL_OPTION_SPOT_PRICE)
  )

  const total = parseFloat(formatUnits(position.size.d, DEFAULT_DECIMALS))
  const margin = parseFloat(formatUnits(position.margin.d, DEFAULT_DECIMALS))
  const profits = parseFloat(formatUnits(pnl.d, DEFAULT_DECIMALS))
  const price = parseFloat(
    formatEther((await contracts[asset].getSpotPrice())[0])
  )

  return Math.abs((total * price) / (margin + profits))
}

const getSpotPrice = async (asset) => {
  return parseFloat(formatEther((await contracts[asset].getSpotPrice())[0]))
}

const getPosition = async (asset) => {
  const position =
    await clearingHouseViewer.getPersonalPositionWithFundingPayment(
      contracts[asset].address,
      layer2Wallet.address
    )
  return parseFloat(formatUnits(position.size.d, DEFAULT_DECIMALS))
}

const getFullPosition = async (asset) => {
  const amm = contracts[asset]

  const position =
    await clearingHouseViewer.getPersonalPositionWithFundingPayment(
      amm.address,
      layer2Wallet.address
    )

  const pnl = await clearingHouseViewer.getUnrealizedPnl(
    amm.address,
    layer2Wallet.address,
    BigNumber.from(PNL_OPTION_SPOT_PRICE)
  )

  const total = parseFloat(formatUnits(position.size.d, DEFAULT_DECIMALS))
  const margin = parseFloat(formatUnits(position.margin.d, DEFAULT_DECIMALS))
  const profits = parseFloat(formatUnits(pnl.d, DEFAULT_DECIMALS))
  const price = parseFloat(
    formatEther((await contracts[asset].getSpotPrice())[0])
  )

  const layer2UsdcDecimals = await layer2Usdc.decimals()

  let wallet = parseFloat(
    formatUnits(
      await layer2Usdc.balanceOf(layer2Wallet.address),
      layer2UsdcDecimals
    )
  )
  
  return { total, margin, profits, wallet, price }
}

