// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWQI} from "./interfaces/IWQI.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MilestoneEscrow — Task Rewards & Milestone-Gated Bounties (Pillar 1)
/// @author MoneePay Protocol
/// @notice Enables task creators to post bounties with milestone-gated tranche releases on Quai Network.
/// @dev Native Qi is wrapped to WQI on deposit and unwrapped back to Qi on each milestone release.
contract MilestoneEscrow is ReentrancyGuard {
    // ═══════════════════════════════════════════════════════════════════════
    //                              TYPES
    // ═══════════════════════════════════════════════════════════════════════

    enum TaskStatus {
        Active,
        Completed,
        Disputed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        Active,
        Completed
    }

    struct Milestone {
        string title;
        uint256 amount; // Qi amount for this tranche
        MilestoneStatus status;
    }

    struct Task {
        address creator;
        address solver;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 createdAt;
        TaskStatus status;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                              STATE
    // ═══════════════════════════════════════════════════════════════════════

    IWQI public immutable wqi;

    mapping(bytes32 => Task) public tasks;
    mapping(bytes32 => Milestone[]) public milestones;
    uint256 public taskCount;

    // ═══════════════════════════════════════════════════════════════════════
    //                              EVENTS
    // ═══════════════════════════════════════════════════════════════════════

    event TaskCreated(
        bytes32 indexed taskId,
        address indexed creator,
        uint256 totalAmount,
        uint8 milestoneCount
    );

    event SolverAssigned(bytes32 indexed taskId, address indexed solver);

    event MilestoneApproved(
        bytes32 indexed taskId,
        uint8 milestoneIndex,
        uint256 amountReleased,
        address indexed solver
    );

    event DisputeInitiated(bytes32 indexed taskId, address indexed initiator);

    event TaskCancelled(bytes32 indexed taskId, address indexed creator, uint256 refundedAmount);

    // ═══════════════════════════════════════════════════════════════════════
    //                              ERRORS
    // ═══════════════════════════════════════════════════════════════════════

    error InvalidMilestoneAllocations();
    error TaskNotFound();
    error TaskNotActive();
    error OnlyCreator();
    error OnlyCreatorOrSolver();
    error SolverAlreadyAssigned();
    error NoSolverAssigned();
    error MilestoneNotActive();
    error TaskAlreadyDisputed();
    error InsufficientDeposit();

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

    /// @notice Create a new task bounty with milestone-gated tranches.
    /// @param _milestoneTitles Array of milestone titles.
    /// @param _milestonePercents Array of milestone percentage allocations (must sum to 100).
    /// @return taskId The unique identifier for the created task.
    function createTask(
        string[] calldata _milestoneTitles,
        uint8[] calldata _milestonePercents
    ) external payable nonReentrant returns (bytes32 taskId) {
        if (msg.value == 0) revert InsufficientDeposit();
        if (_milestoneTitles.length == 0 || _milestoneTitles.length != _milestonePercents.length) {
            revert InvalidMilestoneAllocations();
        }

        // Validate percentages sum to 100
        uint256 totalPercent;
        for (uint256 i = 0; i < _milestonePercents.length; i++) {
            totalPercent += _milestonePercents[i];
        }
        if (totalPercent != 100) revert InvalidMilestoneAllocations();

        // Generate unique task ID
        taskId = keccak256(abi.encodePacked(msg.sender, block.timestamp, taskCount));
        taskCount++;

        // Wrap native Qi → WQI
        wqi.deposit{value: msg.value}();

        // Store task
        tasks[taskId] = Task({
            creator: msg.sender,
            solver: address(0),
            totalAmount: msg.value,
            releasedAmount: 0,
            createdAt: block.timestamp,
            status: TaskStatus.Active
        });

        // Store milestones with calculated Qi amounts
        for (uint256 i = 0; i < _milestoneTitles.length; i++) {
            uint256 trancheAmount = (msg.value * _milestonePercents[i]) / 100;
            milestones[taskId].push(
                Milestone({
                    title: _milestoneTitles[i],
                    amount: trancheAmount,
                    status: i == 0 ? MilestoneStatus.Active : MilestoneStatus.Pending
                })
            );
        }

        emit TaskCreated(taskId, msg.sender, msg.value, uint8(_milestoneTitles.length));
    }

    /// @notice Assign a solver to work on the task.
    /// @param _taskId The task to assign a solver to.
    /// @param _solver The solver's wallet address.
    function assignSolver(bytes32 _taskId, address _solver) external {
        Task storage task = tasks[_taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (task.creator != msg.sender) revert OnlyCreator();
        if (task.status != TaskStatus.Active) revert TaskNotActive();
        if (task.solver != address(0)) revert SolverAlreadyAssigned();

        task.solver = _solver;
        emit SolverAssigned(_taskId, _solver);
    }

    /// @notice Approve the current active milestone and release funds to the solver.
    /// @param _taskId The task whose milestone is being approved.
    function approveMilestone(bytes32 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (task.creator != msg.sender) revert OnlyCreator();
        if (task.status != TaskStatus.Active) revert TaskNotActive();
        if (task.solver == address(0)) revert NoSolverAssigned();

        Milestone[] storage ms = milestones[_taskId];
        uint8 activeIdx = _findActiveMilestone(ms);

        // Mark milestone as completed
        ms[activeIdx].status = MilestoneStatus.Completed;
        uint256 releaseAmount = ms[activeIdx].amount;
        task.releasedAmount += releaseAmount;

        // Activate next milestone or complete the task
        if (activeIdx + 1 < ms.length) {
            ms[activeIdx + 1].status = MilestoneStatus.Active;
        } else {
            task.status = TaskStatus.Completed;
        }

        // Unwrap WQI → Qi and transfer to solver
        wqi.withdraw(releaseAmount);
        (bool success,) = payable(task.solver).call{value: releaseAmount}("");
        require(success, "Transfer failed");

        emit MilestoneApproved(_taskId, activeIdx, releaseAmount, task.solver);
    }

    /// @notice Open a dispute on an active task, freezing remaining tranche funds.
    /// @param _taskId The task to dispute.
    function openDispute(bytes32 _taskId) external {
        Task storage task = tasks[_taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (task.status != TaskStatus.Active) revert TaskNotActive();
        if (msg.sender != task.creator && msg.sender != task.solver) revert OnlyCreatorOrSolver();

        task.status = TaskStatus.Disputed;
        emit DisputeInitiated(_taskId, msg.sender);
    }

    /// @notice Cancel a task before a solver is assigned and refund the creator.
    /// @param _taskId The task to cancel.
    function cancelTask(bytes32 _taskId) external nonReentrant {
        Task storage task = tasks[_taskId];
        if (task.creator == address(0)) revert TaskNotFound();
        if (task.creator != msg.sender) revert OnlyCreator();
        if (task.status != TaskStatus.Active) revert TaskNotActive();
        if (task.solver != address(0)) revert SolverAlreadyAssigned();

        uint256 refund = task.totalAmount - task.releasedAmount;
        task.status = TaskStatus.Cancelled;

        // Unwrap WQI → Qi and refund creator
        wqi.withdraw(refund);
        (bool success,) = payable(task.creator).call{value: refund}("");
        require(success, "Refund failed");

        emit TaskCancelled(_taskId, task.creator, refund);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                           VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @notice Get the number of milestones for a task.
    function getMilestoneCount(bytes32 _taskId) external view returns (uint256) {
        return milestones[_taskId].length;
    }

    /// @notice Get a specific milestone's details.
    function getMilestone(bytes32 _taskId, uint256 _index) external view returns (Milestone memory) {
        return milestones[_taskId][_index];
    }

    // ═══════════════════════════════════════════════════════════════════════
    //                         INTERNAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    /// @dev Find the index of the currently active milestone.
    function _findActiveMilestone(Milestone[] storage ms) internal view returns (uint8) {
        for (uint8 i = 0; i < ms.length; i++) {
            if (ms[i].status == MilestoneStatus.Active) return i;
        }
        revert MilestoneNotActive();
    }

    /// @dev Allow contract to receive native Qi (needed for WQI unwrapping).
    receive() external payable {}
}
