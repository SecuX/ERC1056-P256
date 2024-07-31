const { p256Wallet } = require("./helpers.js");

(async () => {
    const [issuer] = await hre.ethers.getSigners();

    const erc1056 = await hre.ethers.getContractAt("ERC1056P256", process.env.CONTRACT_ADDRESS);
    const result = await erc1056.changeOwner(
        issuer.address,
        p256Wallet.address,
    );
    console.log(result.hash);
})();
