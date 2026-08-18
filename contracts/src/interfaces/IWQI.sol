// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IWQI — Wrapped Qi (WQI) ERC-20 Interface
/// @notice Interface for Quai Network's Wrapped Qi token following the WETH9 deposit/withdraw pattern.
/// @dev Native Qi (UTXO-based) is wrapped into ERC-20 WQI for programmatic use inside smart contracts.
interface IWQI {
    /// @notice Wrap native Qi into WQI tokens (1:1 ratio).
    /// @dev Caller sends native Qi as msg.value; contract mints equivalent WQI to caller.
    function deposit() external payable;

    /// @notice Unwrap WQI tokens back to native Qi (1:1 ratio).
    /// @param amount The amount of WQI to unwrap.
    /// @dev Burns WQI from caller and sends equivalent native Qi back.
    function withdraw(uint256 amount) external;

    // ── Standard ERC-20 Functions ──

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // ── ERC-20 Events ──

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);
}
