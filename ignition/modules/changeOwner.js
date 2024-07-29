const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { p256Wallet } = require("./helpers.js");

module.exports = {
    default: buildModule(`sx${Date.now()}`, (m) => {
        const erc1056 = m.contractAt("ERC1056P256", process.env.CONTRACT_ADDRESS);

        hre.ethers.getSigners()
            .then(([issuer]) => {
                m.call(erc1056, "changeOwner", [issuer.address, p256Wallet.address]);
            });

        return { erc1056 };
    })
}