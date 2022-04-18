require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
module.exports = {
  solidity: "0.6.6",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/RLHBILMi2CAMNo21uHvUYXk7S84TdYEi`,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    kovan: {
      urk: `https://opt-kovan.g.alchemy.com/v2/9SxaJbw-CyjAODVh7X7T5zun7CBbwinK`,
      accounts: [
        process.env.PRIVATE_KEY
      ]
    }
    },
  },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
};

