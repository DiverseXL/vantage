// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VantageMarket
 * @dev A binary prediction market contract where users can place bets on outcomes (0 or 1)
 * and claim a proportional share of the total pool if their outcome wins.
 */
contract VantageMarket is Ownable {
    struct Market {
        uint256 id;
        string description;
        bool resolved;
        uint8 winningOutcome;
        uint256 totalPool0;
        uint256 totalPool1;
        uint256 creationTimestamp;
        bool resolutionProposed;
        uint8 proposedOutcome;
        uint256 challengeWindowEndTime;
    }

    uint256 public constant MIN_BET_AMOUNT = 0.001 ether;
    uint256 public constant CHALLENGE_PERIOD = 24 hours;

    // Auto-incrementing identifier for markets
    uint256 public nextMarketId;

    // Mapping from market ID to Market details
    mapping(uint256 => Market) public markets;

    // Mapping from market ID to bettor to outcome to bet amount
    mapping(uint256 => mapping(address => mapping(uint8 => uint256))) public bets;

    // Mapping from market ID to bettor to claim status
    mapping(uint256 => mapping(address => bool)) public claimed;

    // Events
    event MarketCreated(uint256 indexed id, string description, uint256 creationTimestamp);
    event BetPlaced(uint256 indexed marketId, address indexed bettor, uint8 outcome, uint256 amount);
    event ResolutionProposed(uint256 indexed marketId, uint8 proposedOutcome, uint256 challengeWindowEndTime);
    event MarketResolved(uint256 indexed marketId, uint8 winningOutcome);
    event PayoutClaimed(uint256 indexed marketId, address indexed bettor, uint256 amount);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Creates a new binary prediction market.
     * @dev Only the owner can call this function.
     * @param description A string describing the question or event of the market.
     * @return The ID of the newly created market.
     */
    function createMarket(string calldata description) external onlyOwner returns (uint256) {
        uint256 id = nextMarketId;
        nextMarketId++;

        markets[id] = Market({
            id: id,
            description: description,
            resolved: false,
            winningOutcome: 0,
            totalPool0: 0,
            totalPool1: 0,
            creationTimestamp: block.timestamp,
            resolutionProposed: false,
            proposedOutcome: 0,
            challengeWindowEndTime: 0
        });

        emit MarketCreated(id, description, block.timestamp);
        return id;
    }

    /**
     * @notice Places a bet on a specific outcome of an unresolved market.
     * @dev Requires msg.value > 0 and outcome to be 0 or 1.
     * @param marketId The ID of the market to place a bet on.
     * @param outcome The outcome being bet on (0 for No/Option A, 1 for Yes/Option B).
     */
    function placeBet(uint256 marketId, uint8 outcome) external payable {
        require(marketId < nextMarketId, "Market does not exist");
        Market storage market = markets[marketId];
        require(!market.resolved, "Market already resolved");
        require(outcome == 0 || outcome == 1, "Invalid outcome");
        require(msg.value >= MIN_BET_AMOUNT, "Bet amount must be at least the minimum");

        bets[marketId][msg.sender][outcome] += msg.value;

        if (outcome == 0) {
            market.totalPool0 += msg.value;
        } else {
            market.totalPool1 += msg.value;
        }

        emit BetPlaced(marketId, msg.sender, outcome, msg.value);
    }

    /**
     * @notice Proposes a resolution for a market.
     * @dev Only the owner can call this function. Starts the challenge period.
     * @param marketId The ID of the market to resolve.
     * @param proposedOutcome The proposed winning outcome (0 or 1).
     */
    function proposeResolution(uint256 marketId, uint8 proposedOutcome) external onlyOwner {
        require(marketId < nextMarketId, "Market does not exist");
        Market storage market = markets[marketId];
        require(!market.resolved, "Market already resolved");
        require(proposedOutcome == 0 || proposedOutcome == 1, "Invalid outcome");

        market.resolutionProposed = true;
        market.proposedOutcome = proposedOutcome;
        market.challengeWindowEndTime = block.timestamp + CHALLENGE_PERIOD;

        emit ResolutionProposed(marketId, proposedOutcome, market.challengeWindowEndTime);
    }

    /**
     * @notice Finalizes the resolution of a market after the challenge period.
     * @param marketId The ID of the market to finalize.
     */
    function finalizeResolution(uint256 marketId) external {
        require(marketId < nextMarketId, "Market does not exist");
        Market storage market = markets[marketId];
        require(!market.resolved, "Market already resolved");
        require(market.resolutionProposed, "Resolution not proposed");
        require(block.timestamp >= market.challengeWindowEndTime, "Challenge period not over");

        market.resolved = true;
        market.winningOutcome = market.proposedOutcome;

        emit MarketResolved(marketId, market.winningOutcome);
    }

    /**
     * @notice Claims the payout for a bettor on a resolved market.
     * @dev Bettor receives their proportional share of the losing pool plus their stake back.
     * @param marketId The ID of the resolved market.
     */
    function claimPayout(uint256 marketId) external {
        require(marketId < nextMarketId, "Market does not exist");
        Market storage market = markets[marketId];
        require(market.resolved, "Market not resolved");
        require(!claimed[marketId][msg.sender], "Payout already claimed");

        uint8 winningOutcome = market.winningOutcome;
        uint256 userBet = bets[marketId][msg.sender][winningOutcome];
        require(userBet > 0, "Nothing to claim");

        uint256 totalPool = market.totalPool0 + market.totalPool1;
        uint256 winningPool = winningOutcome == 0 ? market.totalPool0 : market.totalPool1;

        uint256 payout;
        if (totalPool == winningPool) {
            // Losing pool is 0, just refund original bet without extracting profits
            payout = userBet;
        } else {
            // payout = userBet * totalPool / winningPool
            payout = (userBet * totalPool) / winningPool;
        }

        claimed[marketId][msg.sender] = true;

        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Transfer failed");

        emit PayoutClaimed(marketId, msg.sender, payout);
    }
}
