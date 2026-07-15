import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

describe("VantageMarket", function () {
  async function deployVantageMarketFixture() {
    const [owner, userA, userB, userC, nonOwner] = await ethers.getSigners();
    const vantageMarket = await ethers.deployContract("VantageMarket");
    return { vantageMarket, owner, userA, userB, userC, nonOwner };
  }

  describe("Deployment", function () {
    it("Should deploy and confirm the deployer is the owner", async function () {
      const { vantageMarket, owner } = await networkHelpers.loadFixture(deployVantageMarketFixture);
      expect(await vantageMarket.owner()).to.equal(owner.address);
    });
  });

  describe("createMarket", function () {
    it("Should let the owner create a market, increment nextMarketId, and emit MarketCreated", async function () {
      const { vantageMarket, owner } = await networkHelpers.loadFixture(deployVantageMarketFixture);
      const initialId = await vantageMarket.nextMarketId();
      
      const tx = vantageMarket.connect(owner).createMarket("Will ETH cross 5k by end of year?");
      await expect(tx)
        .to.emit(vantageMarket, "MarketCreated");

      expect(await vantageMarket.nextMarketId()).to.equal(initialId + 1n);
    });

    it("Should revert if a non-owner tries to create a market", async function () {
      const { vantageMarket, nonOwner } = await networkHelpers.loadFixture(deployVantageMarketFixture);
      await expect(vantageMarket.connect(nonOwner).createMarket("Non-owner market"))
        .to.be.revertedWithCustomError(vantageMarket, "OwnableUnauthorizedAccount")
        .withArgs(nonOwner.address);
    });
  });

  describe("placeBet", function () {
    async function deployAndCreateMarketFixture() {
      const { vantageMarket, owner, userA, userB, userC, nonOwner } = await deployVantageMarketFixture();
      await vantageMarket.connect(owner).createMarket("Will ETH cross 5k by end of year?");
      const marketId = 0n;
      return { vantageMarket, owner, userA, userB, userC, nonOwner, marketId };
    }

    it("Should let a user bet on outcome 0 and outcome 1, emit BetPlaced, and increase contract balance", async function () {
      const { vantageMarket, userA, userB, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      
      const bet0Tx = vantageMarket.connect(userA).placeBet(marketId, 0, { value: ethers.parseEther("1.0") });
      await expect(bet0Tx)
        .to.emit(vantageMarket, "BetPlaced")
        .withArgs(marketId, userA.address, 0, ethers.parseEther("1.0"));

      const bet1Tx = vantageMarket.connect(userB).placeBet(marketId, 1, { value: ethers.parseEther("2.0") });
      await expect(bet1Tx)
        .to.emit(vantageMarket, "BetPlaced")
        .withArgs(marketId, userB.address, 1, ethers.parseEther("2.0"));

      expect(await ethers.provider.getBalance(await vantageMarket.getAddress())).to.equal(ethers.parseEther("3.0"));
    });

    it("Should revert if betting with msg.value < minBetAmount", async function () {
      const { vantageMarket, userA, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      await expect(vantageMarket.connect(userA).placeBet(marketId, 0, { value: ethers.parseEther("0.0001") }))
        .to.be.revertedWith("Bet amount must be at least the minimum");
    });

    it("Should revert if betting with an invalid outcome", async function () {
      const { vantageMarket, userA, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      await expect(vantageMarket.connect(userA).placeBet(marketId, 2, { value: ethers.parseEther("1.0") }))
        .to.be.revertedWith("Invalid outcome");
    });

    it("Should revert if betting on a nonexistent market ID", async function () {
      const { vantageMarket, userA } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      await expect(vantageMarket.connect(userA).placeBet(999n, 0, { value: ethers.parseEther("1.0") }))
        .to.be.revertedWith("Market does not exist");
    });

    it("Should revert if betting on an already-resolved market", async function () {
      const { vantageMarket, owner, userA, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      await vantageMarket.connect(owner).proposeResolution(marketId, 0);
      await networkHelpers.time.increase(24 * 60 * 60 + 1);
      await vantageMarket.connect(owner).finalizeResolution(marketId);
      await expect(vantageMarket.connect(userA).placeBet(marketId, 0, { value: ethers.parseEther("1.0") }))
        .to.be.revertedWith("Market already resolved");
    });
  });

  describe("propose and finalize resolution", function () {
    async function deployAndCreateMarketFixture() {
      const { vantageMarket, owner, userA, userB, userC, nonOwner } = await deployVantageMarketFixture();
      await vantageMarket.connect(owner).createMarket("Will ETH cross 5k by end of year?");
      const marketId = 0n;
      return { vantageMarket, owner, userA, userB, userC, nonOwner, marketId };
    }

    it("Should let the owner propose a resolution and emit ResolutionProposed", async function () {
      const { vantageMarket, owner, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      const tx = await vantageMarket.connect(owner).proposeResolution(marketId, 0);
      const block = await ethers.provider.getBlock(tx.blockNumber!);
      await expect(tx)
        .to.emit(vantageMarket, "ResolutionProposed")
        .withArgs(marketId, 0, block!.timestamp + 24 * 60 * 60);
    });

    it("Should revert if a non-owner tries to propose a resolution", async function () {
      const { vantageMarket, nonOwner, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      await expect(vantageMarket.connect(nonOwner).proposeResolution(marketId, 0))
        .to.be.revertedWithCustomError(vantageMarket, "OwnableUnauthorizedAccount")
        .withArgs(nonOwner.address);
    });

    it("Should allow anyone to finalize after the challenge period, emitting MarketResolved", async function () {
      const { vantageMarket, owner, nonOwner, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      await vantageMarket.connect(owner).proposeResolution(marketId, 0);
      
      // Attempt to finalize early
      await expect(vantageMarket.connect(nonOwner).finalizeResolution(marketId))
        .to.be.revertedWith("Challenge period not over");

      // Advance time
      await networkHelpers.time.increase(24 * 60 * 60 + 1);

      await expect(vantageMarket.connect(nonOwner).finalizeResolution(marketId))
        .to.emit(vantageMarket, "MarketResolved")
        .withArgs(marketId, 0);
    });

    it("Should revert if proposing with an invalid outcome", async function () {
      const { vantageMarket, owner, marketId } = await networkHelpers.loadFixture(deployAndCreateMarketFixture);
      await expect(vantageMarket.connect(owner).proposeResolution(marketId, 2))
        .to.be.revertedWith("Invalid outcome");
    });
  });

  describe("claimPayout", function () {
    async function setupBettingScenario() {
      const { vantageMarket, owner, userA, userB, userC, nonOwner } = await deployVantageMarketFixture();
      await vantageMarket.connect(owner).createMarket("Will ETH cross 5k by end of year?");
      const marketId = 0n;

      // User A bets 0.1 ETH on outcome 0
      await vantageMarket.connect(userA).placeBet(marketId, 0, { value: ethers.parseEther("0.1") });
      // User B bets 0.2 ETH on outcome 0
      await vantageMarket.connect(userB).placeBet(marketId, 0, { value: ethers.parseEther("0.2") });
      // User C bets 0.3 ETH on outcome 1
      await vantageMarket.connect(userC).placeBet(marketId, 1, { value: ethers.parseEther("0.3") });

      return { vantageMarket, owner, userA, userB, userC, nonOwner, marketId };
    }

    it("Should prevent claiming before the market is resolved", async function () {
      const { vantageMarket, userA, marketId } = await networkHelpers.loadFixture(setupBettingScenario);
      await expect(vantageMarket.connect(userA).claimPayout(marketId))
        .to.be.revertedWith("Market not resolved");
    });

    it("Should distribute proportional payouts and reflect correctly in ETH balances (testing multiple distinct claimants)", async function () {
      const { vantageMarket, owner, userA, userB, marketId } = await networkHelpers.loadFixture(setupBettingScenario);

      // Resolve to outcome 0
      await vantageMarket.connect(owner).proposeResolution(marketId, 0);
      await networkHelpers.time.increase(24 * 60 * 60 + 1);
      await vantageMarket.connect(owner).finalizeResolution(marketId);

      // Total Pool: 0.6 ETH. Outcome 0 Pool: 0.3 ETH.
      // User A payout = 0.1 * 0.6 / 0.3 = 0.2 ETH.
      // User B payout = 0.2 * 0.6 / 0.3 = 0.4 ETH.

      // Both userA and userB successfully claim (proves single-claim bug is resolved natively)
      await expect(vantageMarket.connect(userA).claimPayout(marketId))
        .to.changeEtherBalance(ethers, userA, ethers.parseEther("0.2"));

      await expect(vantageMarket.connect(userB).claimPayout(marketId))
        .to.changeEtherBalance(ethers, userB, ethers.parseEther("0.4"));
    });

    it("Should revert if a losing bettor attempts to claim", async function () {
      const { vantageMarket, owner, userC, marketId } = await networkHelpers.loadFixture(setupBettingScenario);
      await vantageMarket.connect(owner).proposeResolution(marketId, 0);
      await networkHelpers.time.increase(24 * 60 * 60 + 1);
      await vantageMarket.connect(owner).finalizeResolution(marketId);

      await expect(vantageMarket.connect(userC).claimPayout(marketId))
        .to.be.revertedWith("Nothing to claim");
    });

    it("Should revert if a user attempts to claim twice", async function () {
      const { vantageMarket, owner, userA, marketId } = await networkHelpers.loadFixture(setupBettingScenario);
      await vantageMarket.connect(owner).proposeResolution(marketId, 0);
      await networkHelpers.time.increase(24 * 60 * 60 + 1);
      await vantageMarket.connect(owner).finalizeResolution(marketId);

      await vantageMarket.connect(userA).claimPayout(marketId);

      await expect(vantageMarket.connect(userA).claimPayout(marketId))
        .to.be.revertedWith("Payout already claimed");
    });

    it("Should test zero-pool refund logic", async function () {
      const { vantageMarket, owner, userA, userB } = await deployVantageMarketFixture();
      await vantageMarket.connect(owner).createMarket("Zero pool market");
      const marketId = 0n;

      // Both userA and userB bet on outcome 0, NO bets on outcome 1
      await vantageMarket.connect(userA).placeBet(marketId, 0, { value: ethers.parseEther("0.1") });
      await vantageMarket.connect(userB).placeBet(marketId, 0, { value: ethers.parseEther("0.2") });

      await vantageMarket.connect(owner).proposeResolution(marketId, 0);
      await networkHelpers.time.increase(24 * 60 * 60 + 1);
      await vantageMarket.connect(owner).finalizeResolution(marketId);

      // They should just get their original bets back since there's no losing pool to extract profit from.
      await expect(vantageMarket.connect(userA).claimPayout(marketId))
        .to.changeEtherBalance(ethers, userA, ethers.parseEther("0.1"));
        
      await expect(vantageMarket.connect(userB).claimPayout(marketId))
        .to.changeEtherBalance(ethers, userB, ethers.parseEther("0.2"));
    });
  });
});
