import { useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address, AddressInput, Balance, EtherInput, InputBase, IntegerInput } from "~~/components/scaffold-eth";
import {
  useDeployedContractInfo,
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventHistory,
} from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const deployedAt = {
  1: 18843010n,
  10: 113834574n,
};

const Home: NextPage = () => {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: bonusBuidlGuidlContract } = useDeployedContractInfo("BonusBuidlGuidl");

  const [etherAmount, setEtherAmount] = useState("");
  const [toAddressEth, setToAddressEth] = useState("");
  const [reasonEth, setReasonEth] = useState("");

  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [toAddressToken, setToAddressToken] = useState("");
  const [reasonToken, setReasonToken] = useState("");

  const { data: isOwner } = useScaffoldContractRead({
    contractName: "BonusBuidlGuidl",
    functionName: "isOwner",
    args: [address],
  });

  const { data: events, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "BonusBuidlGuidl",
    eventName: "EtherSent",
    fromBlock: deployedAt[targetNetwork.id as 1 | 10],
    blockData: true,
  });

  const { writeAsync: sendEther } = useScaffoldContractWrite({
    contractName: "BonusBuidlGuidl",
    functionName: "sendEther",
    args: [toAddressEth, parseEther(etherAmount), reasonEth],
  });

  const { writeAsync: sendToken } = useScaffoldContractWrite({
    contractName: "BonusBuidlGuidl",
    functionName: "transferERC20",
    args: [tokenAddress, toAddressToken, parseEther(tokenAmount), reasonToken],
  });

  const SendEthUI = (
    <div className="flex items-center flex-col pt-10">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="card-title">Send Ether</div>
          Amount
          <EtherInput
            placeholder="amount of ether"
            value={etherAmount}
            onChange={v => {
              setEtherAmount(v);
            }}
          />
          Recipient
          <AddressInput
            placeholder="address"
            value={toAddressEth}
            onChange={v => {
              setToAddressEth(v);
            }}
          />
          Reason
          <InputBase name="reason" value={reasonEth} placeholder="Reason" onChange={setReasonEth} />
          <div className="card-actions justify-end p-4">
            <button className="btn btn-primary" onClick={() => sendEther()}>
              Send Bonus
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const SendTokenUI = (
    <div className="flex items-center flex-col pt-10">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="card-title">Send ERC20</div>
          Token
          {/* ToDo. More tokens. For now just OP */}
          <select
            className="form-select"
            aria-label="Select Token"
            disabled={targetNetwork.id !== 10}
            onChange={e => {
              setTokenAddress(e.target.value);
            }}
          >
            <option>-- Select --</option>
            <option value="0x4200000000000000000000000000000000000042">OP</option>
          </select>
          Amount
          <IntegerInput
            placeholder="amount of token"
            disableMultiplyBy1e18
            value={tokenAmount}
            onChange={v => {
              setTokenAmount(v as string);
            }}
          />
          to
          <AddressInput
            placeholder="address"
            value={toAddressToken}
            onChange={v => {
              setToAddressToken(v);
            }}
          />
          Reason
          <InputBase name="reason" value={reasonToken} placeholder="Reason" onChange={setReasonToken} />
          <div className="card-actions justify-end p-4">
            <button className="btn btn-primary" onClick={() => sendToken()}>
              Send Bonus
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <MetaHeader />
      <div>
        <div className="flex justify-center">
          <Image src="/bonus.png" width="300" height="300" alt="bonus logo" />
        </div>
        <div className="flex items-center flex-col flex-grow">
          <Address address={bonusBuidlGuidlContract?.address} size="xl" />
          <Balance address={bonusBuidlGuidlContract?.address} />
        </div>
        {isOwner && (
          <div className="flex justify-center gap-10">
            {SendEthUI}
            {SendTokenUI}
          </div>
        )}
        <div className="flex items-center flex-col flex-grow pt-10">
          {isLoadingEvents && (
            <div>
              <span className="loading loading-dots loading-md"></span>
            </div>
          )}
          {events?.map(event => {
            return (
              <div key={event.log.transactionHash} className="card w-96 bg-base-100 shadow-xl items-center m-3">
                <div className="card-body">
                  <div className="flex flex-row p-2">
                    <div className="flex gap-1 items-center">
                      Sent
                      <span className="font-bold">{formatEther(event.args.amount || 0n).substring(0, 6)}</span>
                      <span className="text-[0.6em] font-bold">ETH</span> to
                    </div>
                    <div className="ml-1">
                      <Address address={event.args.recipient} />
                    </div>
                  </div>
                  <div className="text-center italic text-sm">{event.args.reason}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Home;
