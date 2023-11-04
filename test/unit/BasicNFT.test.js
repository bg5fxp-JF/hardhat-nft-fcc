const { ethers, network, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNFT", function () {
          let NFT, deployer;
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["basicNft"]);
              NFT = await ethers.getContract("BasicNFT");
          });

          describe("constructor", function () {
              it("should initialise Token name and symbol", async function () {
                  const name = await NFT.name();
                  const symbol = await NFT.symbol();

                  assert.equal(name, "Dogie");
                  assert.equal(symbol, "DOG");
              });
              it("should initialize NFT token count to 0", async function () {
                  assert.equal((await NFT.getTokenCounter()).toString(), "0");
              });
          });

          describe("tokenURI", function () {
              it("token uri should be equal to one specified in contract", async function () {
                  assert.equal(
                      (await NFT.tokenURI(0)).toString(),
                      "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
                  );
              });
          });

          describe("Mint NFT", function () {
              beforeEach(async function () {
                  const tx = await NFT.mintNft();
                  await tx.wait(1);
              });

              it("should increment token count when an nft is minted", async function () {
                  assert.equal((await NFT.getTokenCounter()).toString(), "1");
              });
              it("Show the correct balance and owner of an NFT", async function () {
                  const deployerBalance = await NFT.balanceOf(deployer);
                  const owner = await NFT.ownerOf("0");
                  assert.equal(deployerBalance.toString(), "1");
                  assert.equal(owner, deployer);
              });
          });
      });
