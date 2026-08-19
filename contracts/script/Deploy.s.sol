// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MilestoneEscrow} from "../src/MilestoneEscrow.sol";
import {ProductEscrow} from "../src/ProductEscrow.sol";
import {BatchPayroll} from "../src/BatchPayroll.sol";
import {MockWQI} from "../test/mocks/MockWQI.sol";

/// @title Deploy — MoneePay Protocol Deployment Script
/// @notice Deploys all core contracts (and MockWQI if WQI_ADDRESS is not set) to target network.
/// @dev Usage: forge script script/Deploy.s.sol --rpc-url <RPC_URL> --broadcast --env-file .env
contract DeployScript is Script {
    function run() external {
        address wqiAddress = vm.envOr("WQI_ADDRESS", address(0));

        vm.startBroadcast();

        address deployer = msg.sender;

        if (wqiAddress == address(0)) {
            MockWQI mockWqi = new MockWQI();
            wqiAddress = address(mockWqi);
            console.log("MockWQI deployed at:", wqiAddress);
        }

        // ── Deploy Pillar 1: Milestone Escrow ──
        MilestoneEscrow milestoneEscrow = new MilestoneEscrow(wqiAddress, deployer);
        console.log("MilestoneEscrow deployed at:", address(milestoneEscrow));

        // ── Deploy Pillar 2: Product Escrow ──
        ProductEscrow productEscrow = new ProductEscrow(wqiAddress, deployer);
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

