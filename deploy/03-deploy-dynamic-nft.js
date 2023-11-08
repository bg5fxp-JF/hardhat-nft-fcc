const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config;
const fs = require("fs");

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    log("----------------------------------------------------------------");

    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.config.name)) {
        const EthUsdAggregator = await ethers.getContract("MockV3Aggregator");
        ethUsdPriceFeedAddress = EthUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    const lowSVG = fs.readFileSync("./images/frown.svg", { encoding: "utf8" });
    const highSVG = fs.readFileSync("./images/happy.svg", { encoding: "utf8" });

    const args = [ethUsdPriceFeedAddress, lowSVG, highSVG];

    const dynamicSVGNFT = await deploy("DynamicSVGNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...");
        await verify(dynamicSVGNFT.address, args);
    }
};

module.exports.tags = ["all", "dynamicSvgNft"];
