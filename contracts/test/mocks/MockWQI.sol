// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title MockWQI — Mock Wrapped Qi Token for Testing
/// @notice Implements the WETH9-style deposit/withdraw pattern for unit tests.
/// @dev Follows the same interface as the real WQI token on Quai Network.
contract MockWQI is ERC20 {
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);

    constructor() ERC20("Wrapped Qi", "WQI") {}

    /// @notice Wrap native Qi into WQI tokens (1:1 ratio).
    function deposit() external payable {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Unwrap WQI tokens back to native Qi (1:1 ratio).
    /// @param amount The amount of WQI to unwrap.
    function withdraw(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "MockWQI: insufficient balance");
        _burn(msg.sender, amount);
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "MockWQI: transfer failed");
        emit Withdrawal(msg.sender, amount);
    }

    /// @dev Allow contract to receive native Qi.
    receive() external payable {
        _mint(msg.sender, msg.value);
        emit Deposit(msg.sender, msg.value);
    }
}
