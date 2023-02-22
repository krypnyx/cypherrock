const bitcoin = require("bitcoin-core");
const bip39 = require("bip39");
const hdkey = require("hdkey");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { promisify } = require("util");
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const dotenv = require("dotenv");

dotenv.config();

const rpcConfig = {
  username: "x",
  password: process.env.API_KEY,
  network: "testnet",
};

const client = new bitcoin(rpcConfig);

// Creates a new wallet with a randomly generated mnemonic
const createWallet = async () => {
  const mnemonic = bip39.generateMnemonic();
  const wallet = {
    id: uuidv4(),
    mnemonic,
  };
  const path = `./wallets/${wallet.id}.json`;
  await writeFile(path, JSON.stringify(wallet));
  console.log(`Wallet created with ID: ${wallet.id}`);
  console.log(`Mnemonic: ${wallet.mnemonic}`);
};

// Imports a wallet from a BIP39 mnemonic
const importWallet = async (mnemonic) => {
  const id = uuidv4();
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const masterPrivateKey = root.privateKey.toString("hex");
  const path = `./wallets/${id}.json`;
  const wallet = {
    id,
    mnemonic,
    masterPrivateKey,
  };
  await writeFile(path, JSON.stringify(wallet));
  console.log(`Wallet imported with ID: ${id}`);
};

// Lists all the wallets
const listWallets = async () => {
  const walletsDir = "./wallets";
  const files = await fs.promises.readdir(walletsDir);
  const wallets = [];
  for (const file of files) {
    const content = await readFile(`${walletsDir}/${file}`, "utf8");
    wallets.push(JSON.parse(content));
  }
  console.log("Wallets:");
  wallets.forEach((wallet) => {
    console.log(`- ID: ${wallet.id}, Mnemonic: ${wallet.mnemonic}`);
  });
};

// Gets the bitcoin balance of a wallet
const getBalance = async (id) => {
  const path = `./wallets/${id}.json`;
  const content = await readFile(path, "utf8");
  const wallet = JSON.parse(content);
  const address = await client.getNewAddress(wallet.id);
  const balance = await client.getReceivedByAddress(address);
  console.log(`Wallet ID: ${id}, Balance: ${balance}`);
};

// Gets the list of bitcoin transactions of a wallet
const getTransactions = async (id) => {
  const path = `./wallets/${id}.json`;
  const content = await readFile(path, "utf8");
  const wallet = JSON.parse(content);
  const address = await client.getNewAddress(wallet.id);
  const transactions = await client.listTransactions("*", 100, 0, true);
  const walletTransactions = transactions.filter((t) => t.address === address);
  console.log(`Wallet ID: ${id}, Transactions:`);
  walletTransactions.forEach((t) => {
    console.log(
      `- Hash: ${t.txid}, Amount: ${t.amount}, Confirmations: ${t.confirmations}`
    );
  });
};

// Generates an unused bitcoin address for a wallet
const generateAddress = async (walletId) => {
  const content = await readFile(`./wallets/${walletId}.json`, "utf8");
  const wallet = JSON.parse(content);
  const seed = await bip39.mnemonicToSeed(wallet.mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const masterPrivateKey = root.privateKey.toString("hex");
  const addressNode = root.derive("m/0'/0'/0'");
  const { address } = client.command("getnewaddress", "", "bech32");
  console.log(`New Address: ${address}`);
};

module.exports = {
  createWallet,
  importWallet,
  listWallets,
  getBalance,
  getTransactions,
  generateAddress,
  client,
};
