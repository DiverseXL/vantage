import { network } from "hardhat";

const { ethers } = await network.connect();

const [deployer] = await ethers.getSigners();

const balance = await ethers.provider.getBalance(deployer.address);
console.log("Deployer address:", deployer.address);
console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

console.log("Deploying VantageMarket...");
const vantageMarket = await ethers.deployContract("VantageMarket");

const deployTx = vantageMarket.deploymentTransaction();
if (deployTx === null) {
  throw new Error("Deployment transaction not found");
}

console.log("Deployment transaction hash:", deployTx.hash);
console.log("Waiting for deployment to be mined...");

await vantageMarket.waitForDeployment();

const contractAddress = await vantageMarket.getAddress();
console.log("VantageMarket deployed to:", contractAddress);
