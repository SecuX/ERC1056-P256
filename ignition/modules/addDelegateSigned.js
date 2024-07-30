const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { EthrDidController, stringToBytes32 } = require("ethr-did-resolver");
const { p256Wallet } = require("./helpers.js");

module.exports = {
    default: buildModule(`sx${Date.now()}`, (m) => {
        const erc1056 = m.contractAt("ERC1056P256", process.env.CONTRACT_ADDRESS);

        hre.ethers.getSigners()
            .then(async ([issuer]) => {
                const ethrDID = new EthrDidController(
                    issuer.address,
                    undefined,
                    issuer,
                    undefined,
                    undefined,
                    undefined,
                    process.env.CONTRACT_ADDRESS
                );

                const delegateType = "veriKey";
                const delegateTypeBytes = stringToBytes32(delegateType);
                const delegate = p256Wallet.address;
                const exp = 86400;
                const hash = await ethrDID.createAddDelegateHash(delegateType, delegate, exp);
                const signature = p256Wallet.sign(hash);

                m.call(erc1056, "addDelegateSigned(address,bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256)", [
                    issuer.address,
                    signature.r,
                    signature.s,
                    p256Wallet.pubKey.x,
                    p256Wallet.pubKey.y,
                    delegateTypeBytes,
                    delegate,
                    exp,
                ]);
            });

        return { erc1056 };
    })
}
