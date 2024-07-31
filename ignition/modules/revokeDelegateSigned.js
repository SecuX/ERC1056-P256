const { EthrDidController, stringToBytes32 } = require("ethr-did-resolver");
const { p256Wallet } = require("./helpers.js");

(async () => {
    const [issuer] = await hre.ethers.getSigners();
    const ethrDID = new EthrDidController(
        issuer.address,
        undefined,
        issuer,
        undefined,
        undefined,
        undefined,
        process.env.CONTRACT_ADDRESS,
        false
    );

    const delegateType = "veriKey";
    const delegateTypeBytes = stringToBytes32(delegateType);
    const delegate = p256Wallet.address;
    const hash = await ethrDID.createRevokeDelegateHash(delegateType, delegate);
    const signature = p256Wallet.sign(hash);

    const erc1056 = await hre.ethers.getContractAt("ERC1056P256", process.env.CONTRACT_ADDRESS);
    const result = await erc1056.revokeDelegateSigned(
        issuer.address,
        signature.r,
        signature.s,
        p256Wallet.pubKey.x,
        p256Wallet.pubKey.y,
        delegateTypeBytes,
        delegate,
        {}
    );
    console.log(result.hash);
})();
