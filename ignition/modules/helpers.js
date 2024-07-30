const secp256r1 = require("secp256r1");
const { keccak256 } = require("ethers");

const _sign = function (msg, privKey) {
    const { signature } = secp256r1.sign(msg, privKey);
    return {
        signature,
        r: "0x" + signature.slice(0, 32).toString("hex"),
        s: "0x" + signature.slice(32, 64).toString("hex"),
    }
};

const generateP256Wallet = function (privKey) {
    if (!Buffer.isBuffer(privKey)) {
        if (/^0x/.test(privKey)) privKey = privKey.slice(2);
        privKey = Buffer.from(privKey, "hex");
    }
    const pubKey = secp256r1.publicKeyCreate(privKey, false);
    const address = "0x" + keccak256(pubKey.slice(1)).slice(-40);

    return {
        pubKey: {
            value: "0x" + pubKey.toString("hex"),
            x: "0x" + pubKey.slice(1, 33).toString("hex"),
            y: "0x" + pubKey.slice(33, 65).toString("hex"),
        },
        address,
        sign: (msg) => {
            if (Buffer.isBuffer(msg)) return _sign(msg, privKey);
            if (/^0x/.test(msg)) return _sign(Buffer.from(msg.slice(2), "hex"), privKey);

            return _sign(Buffer.from(msg), privKey);
        },
    }
}
const p256Wallet = generateP256Wallet(process.env.P256_PRIVATE_KEY);

module.exports = { p256Wallet };