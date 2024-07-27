const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { p256Wallet } = require("./helpers.js");

module.exports = {
    default: buildModule(`sx${Date.now()}`, (m) => {
        const erc1056 = m.contractAt("ERC1056P256", process.env.CONTRACT_ADDRESS);
        m.call(erc1056, "changeOwner", ["0xE2E7A1A1f644c364AB166d3c660c8C3343F78b01", p256Wallet.address]);

        return { erc1056 };
    })
}