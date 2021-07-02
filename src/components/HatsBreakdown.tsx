import React, { useState } from "react";
import { useSelector } from "react-redux";
import Logo from "../assets/icons/logo.icon";
import "../styles/HatsBreakdown.scss";
import millify from "millify";
import { getStakerAmounts } from "../graphql/subgraph";
import { useQuery } from "@apollo/react-hooks";
import { fromWei, getTokenMarketCap, getTokenPrice } from "../utils";
import { IStaker, IVault } from "../types/types";
import { RootState } from "../reducers";

export default function HatsBreakdown() {
  const hatsBalance = useSelector((state: RootState) => state.web3Reducer.hatsBalance);
  const selectedAddress = useSelector((state: RootState) => state.web3Reducer.provider?.selectedAddress) ?? "";
  const hatsPrice = useSelector((state: RootState) => state.dataReducer.hatsPrice);
  const vaults = useSelector((state: RootState) => state.dataReducer.vaults);
  const { loading, error, data } = useQuery(getStakerAmounts(selectedAddress), { fetchPolicy: "cache-and-network" });

  const stakerAmounts = React.useMemo(() => {
    if (!loading && !error && data && data.stakers) {
      return data.stakers;
    }
    return [];
  }, [loading, error, data])

  const [totalStaked, setTotalStaked] = useState(0);
  const [stakingAPY, setStakingAPY] = useState(0);

  React.useEffect(() => {
    const getTotalStaked = async () => {
      // TODO: should be staking token, e.g. staker.vault.stakingToken
      const totalStaked = await (await Promise.all(stakerAmounts.map(async (staker: IStaker) => Number(fromWei(staker.amount)) * await getTokenPrice("0x543Ff227F64Aa17eA132Bf9886cAb5DB55DCAddf")))).reduce((a: any, b: any) => a + b, 0);
      setTotalStaked(totalStaked as any);
      let amountToSum = 0;
      stakerAmounts.forEach(async (staked: IStaker) => {
        const userDepositSize = Number(fromWei(staked.amount));
        // TODO: should be staking token, e.g. staked.vault.stakingToken
        const tokenValue: number = await getTokenPrice("0x543Ff227F64Aa17eA132Bf9886cAb5DB55DCAddf")
        let vaultAPY = 0;
        vaults.forEach((vault: IVault) => {
          if (staked.vault.stakingToken === vault.stakingToken) {
            vaultAPY = vault.apy
          }
        });
        amountToSum = amountToSum + (userDepositSize * tokenValue * vaultAPY);
        setStakingAPY(amountToSum / stakerAmounts.length)
      });
    }
    if (stakerAmounts.length > 0) {
      getTotalStaked();
    }
  }, [stakerAmounts, vaults])

  const [hatsMarketCap, setHatsMarketCap] = useState(0);

  React.useEffect(() => {
    const getHatsMarketCap = async () => {
      // TODO: Should be HATS token - e.g. rewards token
      setHatsMarketCap(await getTokenMarketCap("0x543Ff227F64Aa17eA132Bf9886cAb5DB55DCAddf"));
    }
    getHatsMarketCap();
  }, [])

  return <div className="hats-breakdown-wrapper">
    <div className="logo-wrapper">
      <Logo height="100px" />
    </div>
    <div className="data-top">
      <div className="data-square">
        <span>Balance (HATS)</span>
        {!hatsBalance ? "-" : <span>{millify(hatsBalance)}</span>}
      </div>
      <div className="data-square">
        <span>Total Staked</span>
        {loading ? "-" : <span>&#8776; {`$${millify(totalStaked)}`}</span>}
      </div>
      <div className="data-square">
        <span>Staking APY</span>
        {loading ? "-" : <span>{millify(stakingAPY)}%</span>}
      </div>
    </div>
    <div className="data-bottom">
      <div className="data-long">
        <span>HATS price</span>
        {!hatsPrice ? "-" : <span>&#8776; {`$${millify(hatsPrice)}`}</span>}
      </div>
      <div className="data-long">
        <span>Total supply</span>
        {!hatsMarketCap ? "-" : <span>&#8776; {`$${millify(hatsMarketCap)}`}</span>}
      </div>
    </div>
  </div>
}
