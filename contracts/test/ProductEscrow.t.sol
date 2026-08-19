// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {ProductEscrow} from "../src/ProductEscrow.sol";
import {MockWQI} from "./mocks/MockWQI.sol";

contract ProductEscrowTest is Test {
    ProductEscrow public escrow;
    MockWQI public wqi;

    address public seller = makeAddr("seller");
    address public buyer = makeAddr("buyer");
    address public outsider = makeAddr("outsider");
    address public arbitrator = makeAddr("arbitrator");

    uint256 public constant PRICE = 500 ether;
    uint256 public constant DEADLINE_DAYS = 7;

    function setUp() public {
        wqi = new MockWQI();
        escrow = new ProductEscrow(address(wqi), arbitrator);

        vm.deal(seller, 100 ether);
        vm.deal(buyer, 10_000 ether);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     ORDER CREATION
    // ═══════════════════════════════════════════════════════════════

    function test_CreateOrder_Success() public {
        vm.prank(seller);
        bytes32 orderId = escrow.createOrder("MacBook Pro 16", "M4 Max, 64GB RAM", PRICE, DEADLINE_DAYS);

        (address _seller,, uint256 price, uint256 deadlineDays,, string memory title,, ProductEscrow.OrderStatus status) =
            escrow.orders(orderId);

        assertEq(_seller, seller);
        assertEq(price, PRICE);
        assertEq(deadlineDays, DEADLINE_DAYS);
        assertEq(title, "MacBook Pro 16");
        assertEq(uint8(status), uint8(ProductEscrow.OrderStatus.Created));
    }

    function test_CreateOrder_EmitsEvent() public {
        vm.prank(seller);
        vm.expectEmit(false, true, false, true);
        emit ProductEscrow.OrderCreated(bytes32(0), seller, PRICE, DEADLINE_DAYS, "MacBook Pro 16");
        escrow.createOrder("MacBook Pro 16", "M4 Max", PRICE, DEADLINE_DAYS);
    }

    function test_CreateOrder_RevertsOnZeroPrice() public {
        vm.prank(seller);
        vm.expectRevert(ProductEscrow.InvalidPrice.selector);
        escrow.createOrder("Free Item", "desc", 0, DEADLINE_DAYS);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     BUYER DEPOSIT
    // ═══════════════════════════════════════════════════════════════

    function test_DepositEscrow_Success() public {
        bytes32 orderId = _createSampleOrder();

        vm.prank(buyer);
        escrow.depositEscrow{value: PRICE}(orderId);

        (, address _buyer,,, uint256 depositedAt,,, ProductEscrow.OrderStatus status) = escrow.orders(orderId);
        assertEq(_buyer, buyer);
        assertGt(depositedAt, 0);
        assertEq(uint8(status), uint8(ProductEscrow.OrderStatus.Funded));
        assertEq(wqi.balanceOf(address(escrow)), PRICE);
    }

    function test_DepositEscrow_EmitsEvent() public {
        bytes32 orderId = _createSampleOrder();

        vm.prank(buyer);
        vm.expectEmit(false, true, true, true);
        emit ProductEscrow.OrderDeposited(bytes32(0), buyer, seller, PRICE);
        escrow.depositEscrow{value: PRICE}(orderId);
    }

    function test_DepositEscrow_RevertsOnWrongAmount() public {
        bytes32 orderId = _createSampleOrder();

        vm.prank(buyer);
        vm.expectRevert(ProductEscrow.IncorrectDeposit.selector);
        escrow.depositEscrow{value: PRICE - 1}(orderId);
    }

    function test_DepositEscrow_RevertsOnAlreadyFunded() public {
        bytes32 orderId = _createSampleOrder();

        vm.prank(buyer);
        escrow.depositEscrow{value: PRICE}(orderId);

        vm.prank(outsider);
        vm.deal(outsider, PRICE);
        vm.expectRevert(abi.encodeWithSelector(ProductEscrow.OrderNotInStatus.selector, ProductEscrow.OrderStatus.Created));
        escrow.depositEscrow{value: PRICE}(orderId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                  DELIVERY CONFIRMATION
    // ═══════════════════════════════════════════════════════════════

    function test_ConfirmDelivery_TransfersToSeller() public {
        bytes32 orderId = _createAndFundOrder();
        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(buyer);
        escrow.confirmDelivery(orderId);

        assertEq(seller.balance - sellerBalanceBefore, PRICE);

        (,,,,,,, ProductEscrow.OrderStatus status) = escrow.orders(orderId);
        assertEq(uint8(status), uint8(ProductEscrow.OrderStatus.Completed));
    }

    function test_ConfirmDelivery_RevertsForNonBuyer() public {
        bytes32 orderId = _createAndFundOrder();

        vm.prank(seller);
        vm.expectRevert(ProductEscrow.OnlyBuyer.selector);
        escrow.confirmDelivery(orderId);
    }

    function test_ConfirmDelivery_RevertsIfNotFunded() public {
        bytes32 orderId = _createSampleOrder();

        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSelector(ProductEscrow.OrderNotInStatus.selector, ProductEscrow.OrderStatus.Funded));
        escrow.confirmDelivery(orderId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                        DISPUTES
    // ═══════════════════════════════════════════════════════════════

    function test_OpenDispute_ByBuyer() public {
        bytes32 orderId = _createAndFundOrder();

        vm.prank(buyer);
        escrow.openDispute(orderId);

        (,,,,,,, ProductEscrow.OrderStatus status) = escrow.orders(orderId);
        assertEq(uint8(status), uint8(ProductEscrow.OrderStatus.Disputed));
    }

    function test_OpenDispute_BySeller() public {
        bytes32 orderId = _createAndFundOrder();

        vm.prank(seller);
        escrow.openDispute(orderId);

        (,,,,,,, ProductEscrow.OrderStatus status) = escrow.orders(orderId);
        assertEq(uint8(status), uint8(ProductEscrow.OrderStatus.Disputed));
    }

    function test_OpenDispute_RevertsForOutsider() public {
        bytes32 orderId = _createAndFundOrder();

        vm.prank(outsider);
        vm.expectRevert(ProductEscrow.OnlyBuyerOrSeller.selector);
        escrow.openDispute(orderId);
    }

    function test_ConfirmDelivery_RevertsWhenDisputed() public {
        bytes32 orderId = _createAndFundOrder();

        vm.prank(buyer);
        escrow.openDispute(orderId);

        vm.prank(buyer);
        vm.expectRevert(abi.encodeWithSelector(ProductEscrow.OrderNotInStatus.selector, ProductEscrow.OrderStatus.Funded));
        escrow.confirmDelivery(orderId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                    TIMEOUT AUTO-RELEASE
    // ═══════════════════════════════════════════════════════════════

    function test_ClaimTimeout_AfterDeadline() public {
        bytes32 orderId = _createAndFundOrder();
        uint256 sellerBalanceBefore = seller.balance;

        // Fast-forward past deadline
        vm.warp(block.timestamp + (DEADLINE_DAYS * 1 days) + 1);

        vm.prank(seller);
        escrow.claimTimeout(orderId);

        assertEq(seller.balance - sellerBalanceBefore, PRICE);

        (,,,,,,, ProductEscrow.OrderStatus status) = escrow.orders(orderId);
        assertEq(uint8(status), uint8(ProductEscrow.OrderStatus.TimedOut));
    }

    function test_ClaimTimeout_RevertsBeforeDeadline() public {
        bytes32 orderId = _createAndFundOrder();

        vm.prank(seller);
        vm.expectRevert(ProductEscrow.DeadlineNotExpired.selector);
        escrow.claimTimeout(orderId);
    }

    function test_ClaimTimeout_RevertsForNonSeller() public {
        bytes32 orderId = _createAndFundOrder();

        vm.warp(block.timestamp + (DEADLINE_DAYS * 1 days) + 1);

        vm.prank(buyer);
        vm.expectRevert(ProductEscrow.OnlySeller.selector);
        escrow.claimTimeout(orderId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     DEADLINE VIEW
    // ═══════════════════════════════════════════════════════════════

    function test_IsDeadlineExpired_ReturnsFalseBeforeDeadline() public {
        bytes32 orderId = _createAndFundOrder();
        assertFalse(escrow.isDeadlineExpired(orderId));
    }

    function test_IsDeadlineExpired_ReturnsTrueAfterDeadline() public {
        bytes32 orderId = _createAndFundOrder();
        vm.warp(block.timestamp + (DEADLINE_DAYS * 1 days));
        assertTrue(escrow.isDeadlineExpired(orderId));
    }

    // ═══════════════════════════════════════════════════════════════
    //                          HELPERS
    // ═══════════════════════════════════════════════════════════════

    function _createSampleOrder() internal returns (bytes32) {
        vm.prank(seller);
        return escrow.createOrder("MacBook Pro 16", "M4 Max, 64GB RAM, Space Black", PRICE, DEADLINE_DAYS);
    }

    function _createAndFundOrder() internal returns (bytes32) {
        bytes32 orderId = _createSampleOrder();
        vm.prank(buyer);
        escrow.depositEscrow{value: PRICE}(orderId);
        return orderId;
    }

    function _createDisputedOrder() internal returns (bytes32) {
        bytes32 orderId = _createAndFundOrder();
        vm.prank(buyer);
        escrow.openDispute(orderId);
        return orderId;
    }

    // ═══════════════════════════════════════════════════════════════
    //                     DISPUTE RESOLUTION
    // ═══════════════════════════════════════════════════════════════

    function test_ResolveDispute_FullRefundToBuyer() public {
        bytes32 orderId = _createDisputedOrder();

        uint256 buyerBefore = buyer.balance;
        uint256 sellerBefore = seller.balance;

        vm.prank(arbitrator);
        escrow.resolveDispute(orderId, 100); // 100% to buyer

        assertEq(buyer.balance - buyerBefore, PRICE);
        assertEq(seller.balance, sellerBefore);

        (,,,,,,, ProductEscrow.OrderStatus status) = escrow.orders(orderId);
        assertEq(uint8(status), uint8(ProductEscrow.OrderStatus.Completed));
    }

    function test_ResolveDispute_FullPayoutToSeller() public {
        bytes32 orderId = _createDisputedOrder();

        uint256 buyerBefore = buyer.balance;
        uint256 sellerBefore = seller.balance;

        vm.prank(arbitrator);
        escrow.resolveDispute(orderId, 0); // 0% to buyer, 100% to seller

        assertEq(buyer.balance, buyerBefore);
        assertEq(seller.balance - sellerBefore, PRICE);
    }

    function test_ResolveDispute_7030Split() public {
        bytes32 orderId = _createDisputedOrder();

        uint256 buyerBefore = buyer.balance;
        uint256 sellerBefore = seller.balance;

        vm.prank(arbitrator);
        escrow.resolveDispute(orderId, 70); // 70% buyer, 30% seller

        assertEq(buyer.balance - buyerBefore, (PRICE * 70) / 100);
        assertEq(seller.balance - sellerBefore, PRICE - (PRICE * 70) / 100);
    }

    function test_ResolveDispute_RevertsForNonArbitrator() public {
        bytes32 orderId = _createDisputedOrder();

        vm.prank(outsider);
        vm.expectRevert(ProductEscrow.OnlyArbitrator.selector);
        escrow.resolveDispute(orderId, 50);
    }

    function test_ResolveDispute_RevertsIfNotDisputed() public {
        bytes32 orderId = _createAndFundOrder();

        vm.prank(arbitrator);
        vm.expectRevert(ProductEscrow.OrderNotDisputed.selector);
        escrow.resolveDispute(orderId, 50);
    }

    function test_TransferArbitrator() public {
        address newArb = makeAddr("newArbitrator");
        vm.prank(arbitrator);
        escrow.transferArbitrator(newArb);
        assertEq(escrow.arbitrator(), newArb);
    }
}
