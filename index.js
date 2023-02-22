const {
  createWallet,
  importWallet,
  listWallets,
  client,
} = require("./bitcoin");
const yargs = require("yargs");

yargs
  .command("create", "Create a new wallet", () => {}, createWallet)
  .command(
    "import <mnemonic>",
    "Import a wallet from a BIP39 mnemonic",
    (yargs) => {
      yargs.positional("mnemonic", {
        type: "string",
        describe: "The BIP39 mnemonic",
      });
    },
    (argv) => {
      importWallet(argv.mnemonic);
    }
  )
  .command("list", "List all wallets", () => {}, listWallets)
  .command(
    "balance <walletId>",
    "Get bitcoin balance of a wallet",
    (yargs) => {
      yargs.positional("walletId", {
        type: "string",
        describe: "The ID of the wallet",
      });
    },
    async (argv) => {
      const balance = await client.getBalance(argv.walletId);
      console.log(`Balance of wallet ${argv.walletId}: ${balance}`);
    }
  )
  .command(
    "transactions <walletId>",
    "Get list of bitcoin transactions of a wallet",
    (yargs) => {
      yargs.positional("walletId", {
        type: "string",
        describe: "The ID of the wallet",
      });
    },
    async (argv) => {
      const transactions = await client.listTransactions(argv.walletId);
      console.log(
        `Transactions of wallet ${argv.walletId}: ${JSON.stringify(
          transactions,
          null,
          2
        )}`
      );
    }
  )
  .command(
    "address <walletId>",
    "Generate an unused bitcoin address for a wallet",
    (yargs) => {
      yargs.positional("walletId", {
        type: "string",
        describe: "The ID of the wallet",
      });
    },
    async (argv) => {
      const address = await client.getNewAddress(argv.walletId);
      console.log(`New address of wallet ${argv.walletId}: ${address}`);
    }
  )
  .help()
  .alias("help", "h")
  .demandCommand(1, "You need at least one command before moving on")
  .strict().argv;
