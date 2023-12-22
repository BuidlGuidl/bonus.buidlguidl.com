import { useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address, AddressInput, Balance, EtherInput } from "~~/components/scaffold-eth";
import {
  useDeployedContractInfo,
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventHistory,
} from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address } = useAccount();

  const { data: isOwner } = useScaffoldContractRead({
    contractName: "BonusBuidlGuidl",
    functionName: "isOwner",
    args: [address],
  });

  const { data: bonusBuidlGuidlContract } = useDeployedContractInfo("BonusBuidlGuidl");

  const { data: events, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "BonusBuidlGuidl",
    eventName: "EtherSent",
    fromBlock: 0n,
    blockData: true,
  });

  const [etherAmount, setEtherAmount] = useState("");
  const [toAddress, setToAddress] = useState("");

  const { writeAsync: sendEther } = useScaffoldContractWrite({
    contractName: "BonusBuidlGuidl",
    functionName: "sendEther",
    args: [toAddress, parseEther(etherAmount), "hola"],
  });

  const SendEthUI = (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          send{" "}
          <EtherInput
            placeholder="amount of ether"
            value={etherAmount}
            onChange={v => {
              setEtherAmount(v);
            }}
          />{" "}
          to{" "}
          <AddressInput
            placeholder="address"
            value={toAddress}
            onChange={v => {
              setToAddress(v);
            }}
          />
          <div className="card-actions justify-end p-4">
            <button className="btn btn-primary" onClick={() => sendEther()}>
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
        {isOwner && SendEthUI}
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
