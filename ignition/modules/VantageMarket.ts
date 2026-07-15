import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VantageMarketModule = buildModule("VantageMarketModule", (m) => {
  const vantageMarket = m.contract("VantageMarket");

  return { vantageMarket };
});

export default VantageMarketModule;
