const quais = require("../../frontend/node_modules/quais");
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

  console.log("Connecting to Quai Network RPC:", rpcUrl);

  const provider = new quais.JsonRpcProvider(rpcUrl, undefined, { usePathing: false });
  provider.getNetwork = async () => new quais.Network("cyprus1", 15000n);

  const wallet = new quais.Wallet(privateKey, provider);
  wallet.createAccessList = async () => [];

  console.log("Deployer Address:", wallet.address);

  const productArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../out/ProductEscrow.sol/ProductEscrow.json")));
  const batchPayrollArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, "../out/BatchPayroll.sol/BatchPayroll.json")));

  const ipfsHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";
  const gasPrice = 2500000000n; // 2.5 Gwei

  const mockWqiAddr = "0x00354572C988dB5ca96827B091a59dAea71Bfbc6";
  const milestoneAddr = "0x000E6e8eE75Ccea4A0fFBBE88F378ce732de8fbA";

  console.log("✔ [1/4] MockWQI Contract Address:", mockWqiAddr);
  console.log("✔ [2/4] MilestoneEscrow Contract Address:", milestoneAddr);

  let currentNonce = 4;

  // 3. Deploy ProductEscrow
  console.log("\n[3/4] Deploying ProductEscrow...");
  const productFactory = new quais.ContractFactory(productArtifact.abi, productArtifact.bytecode.object, wallet);
  productFactory.IPFSHash = ipfsHash;
  const productEscrow = await productFactory.deploy(mockWqiAddr, { nonce: currentNonce++, gasPrice, gasLimit: 6000000n });
  const productAddr = await productEscrow.getAddress();
  console.log("✔ ProductEscrow Contract Address:", productAddr);
  console.log("  Tx Hash:", productEscrow.deploymentTransaction().hash);

  await new Promise((r) => setTimeout(r, 2000));

  // 4. Deploy BatchPayroll
  console.log("\n[4/4] Deploying BatchPayroll...");
  const batchFactory = new quais.ContractFactory(batchPayrollArtifact.abi, batchPayrollArtifact.bytecode.object, wallet);
  batchFactory.IPFSHash = ipfsHash;
  const batchPayroll = await batchFactory.deploy(mockWqiAddr, { nonce: currentNonce++, gasPrice, gasLimit: 6000000n });
  const batchPayrollAddr = await batchPayroll.getAddress();
  console.log("✔ BatchPayroll Contract Address:", batchPayrollAddr);
  console.log("  Tx Hash:", batchPayroll.deploymentTransaction().hash);

  console.log("\n========================================================");
  console.log("🎉 MoneePay Protocol Contracts Deployed to Quai Testnet!");
  console.log("========================================================");
  console.log(" Network:          Quai Testnet (Orchard / Cyprus-1)");
  console.log(" Deployer:        ", wallet.address);
  console.log(" MockWQI:         ", mockWqiAddr);
  console.log(" MilestoneEscrow: ", milestoneAddr);
  console.log(" ProductEscrow:   ", productAddr);
  console.log(" BatchPayroll:    ", batchPayrollAddr);
  console.log("========================================================");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
