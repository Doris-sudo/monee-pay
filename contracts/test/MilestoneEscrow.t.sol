// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {MilestoneEscrow} from "../src/MilestoneEscrow.sol";
import {MockWQI} from "./mocks/MockWQI.sol";

contract MilestoneEscrowTest is Test {
    MilestoneEscrow public escrow;
    MockWQI public wqi;

    address public creator = makeAddr("creator");
    address public solver = makeAddr("solver");
    address public outsider = makeAddr("outsider");

    uint256 public constant TASK_AMOUNT = 1200 ether;

    function setUp() public {
        wqi = new MockWQI();
        escrow = new MilestoneEscrow(address(wqi));

        vm.deal(creator, 10_000 ether);
        vm.deal(solver, 100 ether);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     TASK CREATION
    // ═══════════════════════════════════════════════════════════════

    function test_CreateTask_Success() public {
        string[] memory titles = new string[](3);
        titles[0] = "Project Setup & Design";
        titles[1] = "Frontend & Escrow Contracts";
        titles[2] = "Mainnet Audit & Deployment";

        uint8[] memory percents = new uint8[](3);
        percents[0] = 33;
        percents[1] = 34;
        percents[2] = 33;

        vm.prank(creator);
        bytes32 taskId = escrow.createTask{value: TASK_AMOUNT}(titles, percents);

        (address _creator,,uint256 totalAmount,, uint256 createdAt, MilestoneEscrow.TaskStatus status) = escrow.tasks(taskId);
        assertEq(_creator, creator);
        assertEq(totalAmount, TASK_AMOUNT);
        assertGt(createdAt, 0);
        assertEq(uint8(status), uint8(MilestoneEscrow.TaskStatus.Active));
        assertEq(escrow.getMilestoneCount(taskId), 3);

        // Verify WQI balance
        assertEq(wqi.balanceOf(address(escrow)), TASK_AMOUNT);
    }

    function test_CreateTask_EmitsEvent() public {
        string[] memory titles = new string[](2);
        titles[0] = "Phase 1";
        titles[1] = "Phase 2";

        uint8[] memory percents = new uint8[](2);
        percents[0] = 40;
        percents[1] = 60;

        vm.prank(creator);
        vm.expectEmit(false, true, false, true);
        emit MilestoneEscrow.TaskCreated(bytes32(0), creator, TASK_AMOUNT, 2);
        escrow.createTask{value: TASK_AMOUNT}(titles, percents);
    }

    function test_CreateTask_RevertsOnZeroDeposit() public {
        string[] memory titles = new string[](1);
        titles[0] = "Task";
        uint8[] memory percents = new uint8[](1);
        percents[0] = 100;

        vm.prank(creator);
        vm.expectRevert(MilestoneEscrow.InsufficientDeposit.selector);
        escrow.createTask{value: 0}(titles, percents);
    }

    function test_CreateTask_RevertsOnInvalidPercents() public {
        string[] memory titles = new string[](2);
        titles[0] = "A";
        titles[1] = "B";

        uint8[] memory percents = new uint8[](2);
        percents[0] = 40;
        percents[1] = 50; // sum = 90, not 100

        vm.prank(creator);
        vm.expectRevert(MilestoneEscrow.InvalidMilestoneAllocations.selector);
        escrow.createTask{value: TASK_AMOUNT}(titles, percents);
    }

    function test_CreateTask_RevertsOnMismatchedArrays() public {
        string[] memory titles = new string[](2);
        titles[0] = "A";
        titles[1] = "B";

        uint8[] memory percents = new uint8[](1);
        percents[0] = 100;

        vm.prank(creator);
        vm.expectRevert(MilestoneEscrow.InvalidMilestoneAllocations.selector);
        escrow.createTask{value: TASK_AMOUNT}(titles, percents);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     SOLVER ASSIGNMENT
    // ═══════════════════════════════════════════════════════════════

    function test_AssignSolver_Success() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        (, address _solver,,,,) = escrow.tasks(taskId);
        assertEq(_solver, solver);
    }

    function test_AssignSolver_RevertsForNonCreator() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(outsider);
        vm.expectRevert(MilestoneEscrow.OnlyCreator.selector);
        escrow.assignSolver(taskId, solver);
    }

    // ═══════════════════════════════════════════════════════════════
    //                  MILESTONE APPROVAL & RELEASE
    // ═══════════════════════════════════════════════════════════════

    function test_ApproveMilestone_ReleasesFirstTranche() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        uint256 solverBalanceBefore = solver.balance;

        vm.prank(creator);
        escrow.approveMilestone(taskId);

        // Solver should receive ~33% of 1200 ether
        uint256 expectedRelease = (TASK_AMOUNT * 33) / 100;
        assertEq(solver.balance - solverBalanceBefore, expectedRelease);

        // First milestone should be completed, second should be active
        MilestoneEscrow.Milestone memory m0 = escrow.getMilestone(taskId, 0);
        MilestoneEscrow.Milestone memory m1 = escrow.getMilestone(taskId, 1);
        assertEq(uint8(m0.status), uint8(MilestoneEscrow.MilestoneStatus.Completed));
        assertEq(uint8(m1.status), uint8(MilestoneEscrow.MilestoneStatus.Active));
    }

    function test_ApproveAllMilestones_CompletesTask() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        // Approve all 3 milestones
        vm.startPrank(creator);
        escrow.approveMilestone(taskId);
        escrow.approveMilestone(taskId);
        escrow.approveMilestone(taskId);
        vm.stopPrank();

        (,,,,, MilestoneEscrow.TaskStatus status) = escrow.tasks(taskId);
        assertEq(uint8(status), uint8(MilestoneEscrow.TaskStatus.Completed));
    }

    function test_ApproveMilestone_RevertsWithNoSolver() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        vm.expectRevert(MilestoneEscrow.NoSolverAssigned.selector);
        escrow.approveMilestone(taskId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                        DISPUTES
    // ═══════════════════════════════════════════════════════════════

    function test_OpenDispute_ByCreator() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        vm.prank(creator);
        escrow.openDispute(taskId);

        (,,,,, MilestoneEscrow.TaskStatus status) = escrow.tasks(taskId);
        assertEq(uint8(status), uint8(MilestoneEscrow.TaskStatus.Disputed));
    }

    function test_OpenDispute_BySolver() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        vm.prank(solver);
        escrow.openDispute(taskId);

        (,,,,, MilestoneEscrow.TaskStatus status) = escrow.tasks(taskId);
        assertEq(uint8(status), uint8(MilestoneEscrow.TaskStatus.Disputed));
    }

    function test_OpenDispute_RevertsForOutsider() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        vm.prank(outsider);
        vm.expectRevert(MilestoneEscrow.OnlyCreatorOrSolver.selector);
        escrow.openDispute(taskId);
    }

    function test_ApproveMilestone_RevertsWhenDisputed() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        vm.prank(creator);
        escrow.openDispute(taskId);

        vm.prank(creator);
        vm.expectRevert(MilestoneEscrow.TaskNotActive.selector);
        escrow.approveMilestone(taskId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     TASK CANCELLATION
    // ═══════════════════════════════════════════════════════════════

    function test_CancelTask_RefundsCreator() public {
        bytes32 taskId = _createSampleTask();

        uint256 balanceBefore = creator.balance;

        vm.prank(creator);
        escrow.cancelTask(taskId);

        assertEq(creator.balance - balanceBefore, TASK_AMOUNT);

        (,,,,, MilestoneEscrow.TaskStatus status) = escrow.tasks(taskId);
        assertEq(uint8(status), uint8(MilestoneEscrow.TaskStatus.Cancelled));
    }

    function test_CancelTask_RevertsIfSolverAssigned() public {
        bytes32 taskId = _createSampleTask();

        vm.prank(creator);
        escrow.assignSolver(taskId, solver);

        vm.prank(creator);
        vm.expectRevert(MilestoneEscrow.SolverAlreadyAssigned.selector);
        escrow.cancelTask(taskId);
    }

    // ═══════════════════════════════════════════════════════════════
    //                          HELPERS
    // ═══════════════════════════════════════════════════════════════

    function _createSampleTask() internal returns (bytes32) {
        string[] memory titles = new string[](3);
        titles[0] = "Project Setup & Design";
        titles[1] = "Frontend & Escrow Contracts";
        titles[2] = "Mainnet Audit & Deployment";

        uint8[] memory percents = new uint8[](3);
        percents[0] = 33;
        percents[1] = 34;
        percents[2] = 33;

        vm.prank(creator);
        return escrow.createTask{value: TASK_AMOUNT}(titles, percents);
    }
}
