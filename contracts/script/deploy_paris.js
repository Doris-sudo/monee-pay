const quais = require("../../frontend/node_modules/quais");
const fs = require("fs");
const { execSync } = require("child_process");

function rpc(method, params) {
  const payload = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
  fs.writeFileSync("tmp_payload.json", payload);
  const out = execSync("curl -m 10 -s -X POST -H 'Content-Type: application/json' --data @tmp_payload.json https://orchard.rpc.quai.network/cyprus1").toString();
  const data = JSON.parse(out);
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}

async function deployOne(name, artifactPath, ctorArgs, wallet, nonce, gasPrice) {
  console.log(`\n[Deploying ${name}] (Nonce: ${nonce})...`);
  const artifact = JSON.parse(fs.readFileSync(artifactPath));
  const factory = new quais.ContractFactory(artifact.abi, artifact.bytecode.object, wallet);
  factory.IPFSHash = "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG";

  const tx = await factory.getDeployTransaction(...ctorArgs);
  tx.from = wallet.address;
  tx.nonce = nonce;
  tx.gasPrice = gasPrice;
  tx.gasLimit = 6000000n;
  tx.chainId = 15000n;
  tx.type = 0;

  const grinded = await factory.grindContractAddress(tx);
  grinded.accessList = await wallet.createAccessList(grinded);
  
  const signed = await wallet.signTransaction(grinded);
  const txHash = rpc("eth_sendRawTransaction", [signed]);
  const addr = quais.ContractFactory.getContractAddress(grinded);

  console.log(`✔ ${name} Address: ${addr}`);
  console.log(`  Tx Hash: ${txHash}`);
  return { name, addr, txHash };
}

async function main() {
  const provider = new quais.JsonRpcProvider("https://orchard.rpc.quai.network/cyprus1", 15000, { usePathing: false });
  provider.getNetwork = async () => new quais.Network("cyprus1", 15000n);

  const pk = "0x47fd1beca0bf1b439c8a4c57ca78183e329713a7badff5847da7c4002bb9a5bd";
  const wallet = new quais.Wallet(pk, provider);
  const deployer = wallet.address;

  const nonceHex = rpc("eth_getTransactionCount", [wallet.address, "latest"]);
  let nonce = parseInt(nonceHex, 16);
  console.log("Deployer:", deployer, "| Current Nonce:", nonce);

  const gasPrice = 5000000000n; // 5 Gwei

  // 1. MockWQI
  const mockWqi = await deployOne("MockWQI", "out/MockWQI.sol/MockWQI.json", [], wallet, nonce++, gasPrice);

  // 2. MilestoneEscrow
  const milestone = await deployOne("MilestoneEscrow", "out/MilestoneEscrow.sol/MilestoneEscrow.json", [mockWqi.addr, deployer], wallet, nonce++, gasPrice);

  // 3. ProductEscrow
  const product = await deployOne("ProductEscrow", "out/ProductEscrow.sol/ProductEscrow.json", [mockWqi.addr, deployer], wallet, nonce++, gasPrice);

  // 4. BatchPayroll
  const batch = await deployOne("BatchPayroll", "out/BatchPayroll.sol/BatchPayroll.json", [mockWqi.addr], wallet, nonce++, gasPrice);

  const summary = {
    network: "Quai Testnet (Orchard / Cyprus-1)",
    chainId: 15000,
    deployer: deployer,
    arbitrator: deployer,
    contracts: {
      MockWQI: { address: mockWqi.addr, txHash: mockWqi.txHash },
      MilestoneEscrow: { address: milestone.addr, txHash: milestone.txHash },
      ProductEscrow: { address: product.addr, txHash: product.txHash },
      BatchPayroll: { address: batch.addr, txHash: batch.txHash }
    }
  };

  fs.writeFileSync("script/deployed-addresses.json", JSON.stringify(summary, null, 2));

  console.log("\n========================================================");
  console.log("🎉 Paris-EVM Smart Contracts Deployed with AccessList!");
  console.log("========================================================");
  console.log(" MockWQI:         ", mockWqi.addr);
  console.log(" MilestoneEscrow: ", milestone.addr);
  console.log(" ProductEscrow:   ", product.addr);
  console.log(" BatchPayroll:    ", batch.addr);
  console.log("========================================================");
}

main().catch(console.error);
