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

    const attrName = "did/pub/secp256r1/veriKey";
    const attrValue = p256Wallet.pubKey.value;
    const exp = 86400;
    const hash = await ethrDID.createSetAttributeHash(attrName, attrValue, exp);
    const signature = p256Wallet.sign(hash);

    const erc1056 = await hre.ethers.getContractAt("ERC1056P256", process.env.CONTRACT_ADDRESS);
    const result = await erc1056.setAttributeSigned(
        issuer.address,
        signature.r,
        signature.s,
        p256Wallet.pubKey.x,
        p256Wallet.pubKey.y,
        stringToBytes32(attrName),
        attrValue,
        exp,
        {}
    );
    console.log(result.hash);
})();
