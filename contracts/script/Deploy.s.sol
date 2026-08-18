// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MilestoneEscrow} from "../src/MilestoneEscrow.sol";
import {ProductEscrow} from "../src/ProductEscrow.sol";
import {BatchPayroll} from "../src/BatchPayroll.sol";

/// @title Deploy — MoneePay Protocol Deployment Script
/// @notice Deploys all 3 core contracts to Quai Network devnet/testnet.
/// @dev Usage: forge script script/Deploy.s.sol --rpc-url <QUAI_RPC> --broadcast --private-key <KEY>
contract DeployScript is Script {
    function run() external {
        // WQI token address on Quai Network (update per environment)
        address wqiAddress = vm.envAddress("WQI_ADDRESS");

        vm.startBroadcast();

        // ── Deploy Pillar 1: Milestone Escrow ──
        MilestoneEscrow milestoneEscrow = new MilestoneEscrow(wqiAddress);
        console.log("MilestoneEscrow deployed at:", address(milestoneEscrow));

        // ── Deploy Pillar 2: Product Escrow ──
        ProductEscrow productEscrow = new ProductEscrow(wqiAddress);
        console.log("ProductEscrow deployed at:", address(productEscrow));

        // ── Deploy Pillar 3: Batch Payroll ──
        BatchPayroll batchPayroll = new BatchPayroll(wqiAddress);
        console.log("BatchPayroll deployed at:", address(batchPayroll));

        vm.stopBroadcast();

        console.log("---");
        console.log("MoneePay Protocol deployment complete.");
        console.log("WQI Token:", wqiAddress);
    }
}
