// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWQI} from "./interfaces/IWQI.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ProductEscrow — Peer-to-Peer Commerce & Product Sales (Pillar 2)
/// @author MoneePay Protocol
/// @notice Enables trustless P2P product sales with delivery-condition-gated escrow on Quai Network.
/// @dev Native Qi is wrapped to WQI on buyer deposit and unwrapped back to Qi on delivery confirmation.
contract ProductEscrow is ReentrancyGuard {
    // ═══════════════════════════════════════════════════════════════════════
    //                              TYPES
    // ═══════════════════════════════════════════════════════════════════════

    enum OrderStatus {
        Created,    // Seller created the listing, awaiting buyer deposit
        Funded,     // Buyer deposited Qi, funds locked in escrow (FUNDED_IN_ESCROW)
        Completed,  // Buyer confirmed delivery, seller paid out
        Disputed,   // Either party opened dispute, funds frozen
        Refunded,   // Order cancelled / refunded to buyer
        TimedOut    // Seller claimed via timeout auto-release
    }

    struct Order {
        address seller;
        address buyer;
        uint256 price;          // Price in native Qi
        uint256 deadlineDays;   // Delivery window in days
        uint256 depositedAt;    // Timestamp when buyer deposited
        string title;           // Product title
        string description;     // Item specs & shipping terms
        OrderStatus status;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                              STATE
    // ═══════════════════════════════════════════════════════════════════════

    IWQI public immutable wqi;

    mapping(bytes32 => Order) public orders;
    uint256 public orderCount;

    // ═══════════════════════════════════════════════════════════════════════
    //                              EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event OrderCreated(
        bytes32 indexed orderId,
        address indexed seller,
        uint256 price,
        uint256 deadlineDays,
        string title
    );

    event OrderDeposited(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amountQi
    );

    event DeliveryConfirmed(
        bytes32 indexed orderId,
        address indexed seller,
        uint256 amountSettled
    );

    event DisputeOpened(bytes32 indexed orderId, address indexed party);

    event OrderRefunded(bytes32 indexed orderId, address indexed buyer, uint256 amount);

    event TimeoutClaimed(bytes32 indexed orderId, address indexed seller, uint256 amount);

    // ═══════════════════════════════════════════════════════════════════════
    //                              ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error OrderNotFound();
    error InvalidPrice();
    error IncorrectDeposit();
    error OrderNotInStatus(OrderStatus expected);
    error OnlySeller();
    error OnlyBuyer();
    error OnlyBuyerOrSeller();
    error DeadlineNotExpired();

    // ═══════════════════════════════════════════════════════════════════════
    //                            CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════════════

    /// @param _wqi Address of the deployed Wrapped Qi (WQI) ERC-20 contract on Quai Network.
    constructor(address _wqi) {
        wqi = IWQI(_wqi);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                         EXTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Seller creates a product listing with an escrow price.
    /// @param _title Product name / item title.
    /// @param _description Item specs, condition, and shipping terms.
    /// @param _price Price in native Qi that buyer must deposit.
    /// @param _deadlineDays Delivery window in days from buyer deposit.
    /// @return orderId The unique identifier for the created order.
    function createOrder(
        string calldata _title,
        string calldata _description,
        uint256 _price,
        uint256 _deadlineDays
    ) external returns (bytes32 orderId) {
        if (_price == 0) revert InvalidPrice();

        orderId = keccak256(abi.encodePacked(msg.sender, block.timestamp, orderCount));
        orderCount++;

        orders[orderId] = Order({
            seller: msg.sender,
            buyer: address(0),
            price: _price,
            deadlineDays: _deadlineDays,
            depositedAt: 0,
            title: _title,
            description: _description,
            status: OrderStatus.Created
        });

        emit OrderCreated(orderId, msg.sender, _price, _deadlineDays, _title);
    }

    /// @notice Buyer deposits native Qi into escrow to purchase the product.
    /// @param _orderId The order to fund.
    function depositEscrow(bytes32 _orderId) external payable nonReentrant {
        Order storage order = orders[_orderId];
        if (order.seller == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Created) revert OrderNotInStatus(OrderStatus.Created);
        if (msg.value != order.price) revert IncorrectDeposit();

        order.buyer = msg.sender;
        order.depositedAt = block.timestamp;
        order.status = OrderStatus.Funded;

        // Wrap native Qi → WQI
        wqi.deposit{value: msg.value}();

        emit OrderDeposited(_orderId, msg.sender, order.seller, msg.value);
    }

    /// @notice Buyer confirms delivery, releasing escrow funds to the seller.
    /// @param _orderId The order to confirm delivery for.
    function confirmDelivery(bytes32 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        if (order.seller == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Funded) revert OrderNotInStatus(OrderStatus.Funded);
        if (msg.sender != order.buyer) revert OnlyBuyer();

        order.status = OrderStatus.Completed;

        // Unwrap WQI → Qi and transfer to seller
        wqi.withdraw(order.price);
        (bool success,) = payable(order.seller).call{value: order.price}("");
        require(success, "Settlement transfer failed");

        emit DeliveryConfirmed(_orderId, order.seller, order.price);
    }

    /// @notice Either party opens a dispute, freezing escrow funds.
    /// @param _orderId The order to dispute.
    function openDispute(bytes32 _orderId) external {
        Order storage order = orders[_orderId];
        if (order.seller == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Funded) revert OrderNotInStatus(OrderStatus.Funded);
        if (msg.sender != order.buyer && msg.sender != order.seller) revert OnlyBuyerOrSeller();

        order.status = OrderStatus.Disputed;
        emit DisputeOpened(_orderId, msg.sender);
    }

    /// @notice Seller claims funds after the delivery deadline expires without buyer objection.
    /// @param _orderId The order to claim via timeout.
    function claimTimeout(bytes32 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        if (order.seller == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Funded) revert OrderNotInStatus(OrderStatus.Funded);
        if (msg.sender != order.seller) revert OnlySeller();

        uint256 deadline = order.depositedAt + (order.deadlineDays * 1 days);
        if (block.timestamp < deadline) revert DeadlineNotExpired();

        order.status = OrderStatus.TimedOut;

        // Unwrap WQI → Qi and transfer to seller
        wqi.withdraw(order.price);
        (bool success,) = payable(order.seller).call{value: order.price}("");
        require(success, "Timeout transfer failed");

        emit TimeoutClaimed(_orderId, order.seller, order.price);
    }

    /// @notice Seller cancels an unfunded order listing.
    /// @param _orderId The order to cancel.
    function cancelOrder(bytes32 _orderId) external {
        Order storage order = orders[_orderId];
        if (order.seller == address(0)) revert OrderNotFound();
        if (msg.sender != order.seller) revert OnlySeller();
        if (order.status != OrderStatus.Created) revert OrderNotInStatus(OrderStatus.Created);

        order.status = OrderStatus.Refunded;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                           VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Check whether the delivery deadline has expired for an order.
    function isDeadlineExpired(bytes32 _orderId) external view returns (bool) {
        Order storage order = orders[_orderId];
        if (order.depositedAt == 0) return false;
        return block.timestamp >= order.depositedAt + (order.deadlineDays * 1 days);
    }

    /// @dev Allow contract to receive native Qi (needed for WQI unwrapping).
    receive() external payable {}
}
