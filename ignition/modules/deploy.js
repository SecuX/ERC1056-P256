const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = {
    default: buildModule("ERC1056", (m) => {
        const erc1056 = m.contract("ERC1056P256");
        return { erc1056 };
    })
}