// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {BatchPayroll} from "../src/BatchPayroll.sol";
import {MockWQI} from "./mocks/MockWQI.sol";

contract BatchPayrollTest is Test {
    BatchPayroll public payroll;
    MockWQI public wqi;

    address public owner = makeAddr("owner");
    address public admin = makeAddr("admin");
    address public outsider = makeAddr("outsider");

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");
    address public diana = makeAddr("diana");

    function setUp() public {
        vm.prank(owner);
        wqi = new MockWQI();

        vm.prank(owner);
        payroll = new BatchPayroll(address(wqi));

        vm.deal(owner, 100_000 ether);
        vm.deal(admin, 100_000 ether);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     BATCH DISBURSEMENT
    // ═══════════════════════════════════════════════════════════════

    function test_DisburseBatch_Success() public {
        address[] memory recipients = new address[](4);
        recipients[0] = alice;
        recipients[1] = bob;
        recipients[2] = charlie;
        recipients[3] = diana;

        uint256[] memory amounts = new uint256[](4);
        amounts[0] = 500 ether;
        amounts[1] = 350 ether;
        amounts[2] = 400 ether;
        amounts[3] = 200 ether;

        uint256 totalAmount = 1450 ether;

        vm.prank(owner);
        bytes32 batchId = payroll.disburseBatch{value: totalAmount}(recipients, amounts);

        // Verify each recipient received WQI tokens
        assertEq(wqi.balanceOf(alice), 500 ether);
        assertEq(wqi.balanceOf(bob), 350 ether);
        assertEq(wqi.balanceOf(charlie), 400 ether);
        assertEq(wqi.balanceOf(diana), 200 ether);

        // Verify batch counter incremented
        assertEq(payroll.batchCount(), 1);
        assertTrue(batchId != bytes32(0));
    }

    function test_DisburseBatch_EmitsEvent() public {
        address[] memory recipients = new address[](2);
        recipients[0] = alice;
        recipients[1] = bob;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 ether;
        amounts[1] = 200 ether;

        vm.prank(owner);
        vm.expectEmit(false, true, false, true);
        emit BatchPayroll.BatchPayrollDisbursed(bytes32(0), owner, 300 ether, 2);
        payroll.disburseBatch{value: 300 ether}(recipients, amounts);
    }

    function test_DisburseBatch_RefundsExcess() public {
        address[] memory recipients = new address[](1);
        recipients[0] = alice;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 ether;

        uint256 balanceBefore = owner.balance;

        vm.prank(owner);
        payroll.disburseBatch{value: 150 ether}(recipients, amounts);

        // Owner should be refunded 50 ether excess
        assertEq(owner.balance, balanceBefore - 100 ether);
    }

    function test_DisburseBatch_RevertsOnEmptyBatch() public {
        address[] memory recipients = new address[](0);
        uint256[] memory amounts = new uint256[](0);

        vm.prank(owner);
        vm.expectRevert(BatchPayroll.EmptyBatch.selector);
        payroll.disburseBatch{value: 0}(recipients, amounts);
    }

    function test_DisburseBatch_RevertsOnArrayMismatch() public {
        address[] memory recipients = new address[](2);
        recipients[0] = alice;
        recipients[1] = bob;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 ether;

        vm.prank(owner);
        vm.expectRevert(BatchPayroll.ArrayLengthMismatch.selector);
        payroll.disburseBatch{value: 100 ether}(recipients, amounts);
    }

    function test_DisburseBatch_RevertsOnZeroAddress() public {
        address[] memory recipients = new address[](1);
        recipients[0] = address(0);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 ether;

        vm.prank(owner);
        vm.expectRevert(BatchPayroll.ZeroAddress.selector);
        payroll.disburseBatch{value: 100 ether}(recipients, amounts);
    }

    function test_DisburseBatch_RevertsOnZeroAmount() public {
        address[] memory recipients = new address[](1);
        recipients[0] = alice;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 0;

        vm.prank(owner);
        vm.expectRevert(BatchPayroll.ZeroAmount.selector);
        payroll.disburseBatch{value: 0}(recipients, amounts);
    }

    function test_DisburseBatch_RevertsOnInsufficientDeposit() public {
        address[] memory recipients = new address[](1);
        recipients[0] = alice;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 ether;

        vm.prank(owner);
        vm.expectRevert(BatchPayroll.InsufficientDeposit.selector);
        payroll.disburseBatch{value: 50 ether}(recipients, amounts);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     RBAC ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════

    function test_DisburseBatch_RevertsForUnauthorized() public {
        address[] memory recipients = new address[](1);
        recipients[0] = alice;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 ether;

        vm.prank(outsider);
        vm.deal(outsider, 100 ether);
        vm.expectRevert(BatchPayroll.Unauthorized.selector);
        payroll.disburseBatch{value: 100 ether}(recipients, amounts);
    }

    function test_GrantAdmin_AllowsDisbursement() public {
        vm.prank(owner);
        payroll.grantAdmin(admin);

        assertTrue(payroll.isAdmin(admin));

        address[] memory recipients = new address[](1);
        recipients[0] = alice;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 ether;

        vm.prank(admin);
        payroll.disburseBatch{value: 100 ether}(recipients, amounts);

        assertEq(wqi.balanceOf(alice), 100 ether);
    }

    function test_RevokeAdmin_BlocksDisbursement() public {
        vm.prank(owner);
        payroll.grantAdmin(admin);

        vm.prank(owner);
        payroll.revokeAdmin(admin);

        assertFalse(payroll.isAdmin(admin));

        address[] memory recipients = new address[](1);
        recipients[0] = alice;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 ether;

        vm.prank(admin);
        vm.deal(admin, 100 ether);
        vm.expectRevert(BatchPayroll.Unauthorized.selector);
        payroll.disburseBatch{value: 100 ether}(recipients, amounts);
    }

    function test_GrantAdmin_RevertsForNonOwner() public {
        vm.prank(outsider);
        vm.expectRevert(BatchPayroll.Unauthorized.selector);
        payroll.grantAdmin(admin);
    }

    function test_TransferOwnership() public {
        vm.prank(owner);
        payroll.transferOwnership(admin);

        assertEq(payroll.owner(), admin);
        assertTrue(payroll.isAdmin(admin));
    }

    function test_TransferOwnership_RevertsForNonOwner() public {
        vm.prank(outsider);
        vm.expectRevert(BatchPayroll.Unauthorized.selector);
        payroll.transferOwnership(outsider);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function test_CalculateBatchTotal() public view {
        uint256[] memory amounts = new uint256[](4);
        amounts[0] = 500 ether;
        amounts[1] = 350 ether;
        amounts[2] = 400 ether;
        amounts[3] = 200 ether;

        uint256 total = payroll.calculateBatchTotal(amounts);
        assertEq(total, 1450 ether);
    }
}
