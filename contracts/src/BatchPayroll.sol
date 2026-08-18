// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWQI} from "./interfaces/IWQI.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BatchPayroll — Corporate Batch Payroll & Stipend Disburser (Pillar 3)
/// @author MoneePay Protocol
/// @notice Enables companies to disburse salaries, stipends, and bonuses to multiple wallets in a single transaction.
/// @dev Optimized for gas efficiency on Quai Network EVM. Up to 95% gas savings vs. individual transfers.
contract BatchPayroll is ReentrancyGuard {
    // ═══════════════════════════════════════════════════════════════════════
    //                              STATE
    // ═══════════════════════════════════════════════════════════════════════

    IWQI public immutable wqi;

    /// @notice Organization treasury admin authorization mapping.
    mapping(address => bool) public isAdmin;

    /// @notice Contract deployer (super admin).
    address public owner;

    /// @notice Running batch counter for unique batch IDs.
    uint256 public batchCount;

    // ═══════════════════════════════════════════════════════════════════════
    //                              EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event BatchPayrollDisbursed(
        bytes32 indexed batchId,
        address indexed orgTreasury,
        uint256 totalAmount,
        uint256 recipientCount
    );

    event AdminGranted(address indexed account, address indexed grantedBy);
    event AdminRevoked(address indexed account, address indexed revokedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ═══════════════════════════════════════════════════════════════════════
    //                              ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error Unauthorized();
    error ArrayLengthMismatch();
    error EmptyBatch();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientDeposit();
    error TransferFailed(address recipient);

    // ═══════════════════════════════════════════════════════════════════════
    //                            MODIFIERS
    // ═══════════════════════════════════════════════════════════════════════

    modifier onlyAdmin() {
        if (!isAdmin[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                            CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    /// @param _wqi Address of the deployed Wrapped Qi (WQI) ERC-20 contract on Quai Network.
    constructor(address _wqi) {
        wqi = IWQI(_wqi);
        owner = msg.sender;
        isAdmin[msg.sender] = true;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                         EXTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Disburse batch payroll to multiple recipients in a single transaction.
    /// @param _recipients Array of employee wallet addresses.
    /// @param _amounts Array of Qi amounts corresponding to each recipient.
    /// @return batchId The unique identifier for this payroll batch.
    /// @dev Auto-wraps native Qi → WQI, then transfers WQI to each recipient.
    ///      Recipients receive WQI tokens which they can unwrap to native Qi.
    ///      Gas optimization: single deposit + batch ERC-20 transfers vs. N individual native transfers.
    function disburseBatch(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external payable onlyAdmin nonReentrant returns (bytes32 batchId) {
        uint256 recipientCount = _recipients.length;

        // ── Input validation ──
        if (recipientCount == 0) revert EmptyBatch();
        if (recipientCount != _amounts.length) revert ArrayLengthMismatch();

        // ── Calculate total and validate deposit ──
        uint256 totalAmount;
        for (uint256 i = 0; i < recipientCount; i++) {
            if (_recipients[i] == address(0)) revert ZeroAddress();
            if (_amounts[i] == 0) revert ZeroAmount();
            totalAmount += _amounts[i];
        }
        if (msg.value < totalAmount) revert InsufficientDeposit();

        // ── Generate unique batch ID ──
        batchId = keccak256(abi.encodePacked(msg.sender, block.timestamp, batchCount));
        batchCount++;

        // ── Single wrap: native Qi → WQI ──
        wqi.deposit{value: totalAmount}();

        // ── Batch transfer WQI to each recipient ──
        for (uint256 i = 0; i < recipientCount; i++) {
            bool success = wqi.transfer(_recipients[i], _amounts[i]);
            if (!success) revert TransferFailed(_recipients[i]);
        }

        // ── Refund excess Qi if overpaid ──
        uint256 excess = msg.value - totalAmount;
        if (excess > 0) {
            (bool refunded,) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Refund failed");
        }

        emit BatchPayrollDisbursed(batchId, msg.sender, totalAmount, recipientCount);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                         ADMIN MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Grant admin role to an address.
    /// @param _account The address to grant admin privileges.
    function grantAdmin(address _account) external onlyOwner {
        if (_account == address(0)) revert ZeroAddress();
        isAdmin[_account] = true;
        emit AdminGranted(_account, msg.sender);
    }

    /// @notice Revoke admin role from an address.
    /// @param _account The address to revoke admin privileges from.
    function revokeAdmin(address _account) external onlyOwner {
        if (_account == address(0)) revert ZeroAddress();
        isAdmin[_account] = false;
        emit AdminRevoked(_account, msg.sender);
    }

    /// @notice Transfer contract ownership.
    /// @param _newOwner The new owner address.
    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert ZeroAddress();
        address previous = owner;
        owner = _newOwner;
        isAdmin[_newOwner] = true;
        emit OwnershipTransferred(previous, _newOwner);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                           VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Calculate the total amount needed for a batch disbursement.
    /// @param _amounts Array of Qi amounts.
    /// @return total The sum of all amounts.
    function calculateBatchTotal(uint256[] calldata _amounts) external pure returns (uint256 total) {
        for (uint256 i = 0; i < _amounts.length; i++) {
            total += _amounts[i];
        }
    }

    /// @dev Allow contract to receive native Qi.
    receive() external payable {}
}
