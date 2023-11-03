const { ethers, network, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT", function () {
          let NFT, deployer;
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture["basicNft"];
              NFT = await ethers.getContract("NFT");
          });

          describe("constructor", function () {
              it("should initialise Token name and symbol", async function () {});
              it("should initialize NFT token count to 0", async function () {});
          });
      });
