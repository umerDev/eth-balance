import "dotenv/config";
import Web3 from "web3";
import { getERC20ABIOfInterest } from "./erc20";
import { writeToPath } from "fast-csv";

const apiKey = process.env.API_KEY;
const endpoint = `https://mainnet.infura.io/v3/${apiKey}`;
const tokenAddress = process.env.TOKEN_ADDRESS;
const walletAddress = process.env.WALLET_ADDRESS;

type balance = {
  tokenAddress: string;
  walletAddress: string;
  balance: string;
};

const initWeb3 = () => {
  const httpProvider = new Web3.providers.HttpProvider(endpoint);
  const web3Client = new Web3(httpProvider);
  return web3Client;
};

const getBalance = async (
  web3Client: Web3,
  tokenAddress: string,
  walletAddress: string
) => {
  const balanceOfAbi = getERC20ABIOfInterest("balanceOf");
  const contract = new web3Client.eth.Contract(balanceOfAbi, tokenAddress);
  const result = await contract.methods.balanceOf(walletAddress).call();

  if (!result) return;

  const resultInEther = web3Client.utils.fromWei(String(result), "ether");

  return resultInEther;
};

const writeCSV = (balance: string) => {
  const data: balance[] = [
    {
      tokenAddress: tokenAddress,
      walletAddress: walletAddress,
      balance: balance,
    },
  ];

  const path = `./data.csv`;

  const options = { headers: true, quoteColumns: true };

  writeToPath(path, data, options)
    .on("error", (err) => console.error(err))
    .on("finish", () => console.log("Done writing."));
};

const main = async () => {
  const web3 = initWeb3();
  const balance = await getBalance(web3, tokenAddress, walletAddress);

  writeCSV(balance);
};

(async () => {
  await main();
})().catch((e: unknown) => {
  const error = e as Error;
  console.error(`error occured: ${error.message}`);
});
