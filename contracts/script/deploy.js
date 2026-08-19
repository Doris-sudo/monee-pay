const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const parts = trimmed.split("=");
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

async function main() {
  loadEnv();

  const rpcUrl = process.env.RPC_URL || "https://orchard.rpc.quai.network/cyprus1";
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("PRIVATE_KEY not found in environment or .env file");

  console.log("Connecting to Quai RPC:", rpcUrl);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Override getAddress/checksum verification in provider RPC calls for Quai compatibility if needed
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deployer Address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log("Deployer Balance:", ethers.formatEther(balance), "QUAI");

  const mockWqiArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../out/MockWQI.sol/MockWQI.json")));
  const milestoneArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../out/MilestoneEscrow.sol/MilestoneEscrow.json")));
  const productArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../out/ProductEscrow.sol/ProductEscrow.json")));
  const batchPayrollArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../out/BatchPayroll.sol/BatchPayroll.json")));

  console.log("\n[1/4] Deploying MockWQI...");
  const MockWQI = new ethers.ContractFactory(mockWqiArtifact.abi, mockWqiArtifact.bytecode.object, wallet);
  const mockWqi = await MockWQI.deploy({ type: 0 });
  await mockWqi.waitForDeployment();
  const mockWqiAddr = await mockWqi.getAddress();
  console.log("✔ MockWQI deployed at:", mockWqiAddr);

  console.log("\n[2/4] Deploying MilestoneEscrow...");
  const MilestoneEscrow = new ethers.ContractFactory(milestoneArtifact.abi, milestoneArtifact.bytecode.object, wallet);
  const milestoneEscrow = await MilestoneEscrow.deploy(mockWqiAddr, { type: 0 });
  await milestoneEscrow.waitForDeployment();
  const milestoneAddr = await milestoneEscrow.getAddress();
  console.log("✔ MilestoneEscrow deployed at:", milestoneAddr);

  console.log("\n[3/4] Deploying ProductEscrow...");
  const ProductEscrow = new ethers.ContractFactory(productArtifact.abi, productArtifact.bytecode.object, wallet);
  const productEscrow = await ProductEscrow.deploy(mockWqiAddr, { type: 0 });
  await productEscrow.waitForDeployment();
  const productAddr = await productEscrow.getAddress();
  console.log("✔ ProductEscrow deployed at:", productAddr);

  console.log("\n[4/4] Deploying BatchPayroll...");
  const BatchPayroll = new ethers.ContractFactory(batchPayrollArtifact.abi, batchPayrollArtifact.bytecode.object, wallet);
  const batchPayroll = await BatchPayroll.deploy(mockWqiAddr, { type: 0 });
  await batchPayroll.waitForDeployment();
  const batchPayrollAddr = await batchPayroll.getAddress();
  console.log("✔ BatchPayroll deployed at:", batchPayrollAddr);

  console.log("\n==========================================");
  console.log(" MoneePay Deployment Completed Successfully!");
  console.log("==========================================");
  console.log(" MockWQI:         ", mockWqiAddr);
  console.log(" MilestoneEscrow: ", milestoneAddr);
  console.log(" ProductEscrow:   ", productAddr);
  console.log(" BatchPayroll:    ", batchPayrollAddr);
  console.log("==========================================");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
