const { ethers } = require('hardhat');
const secp256r1 = require('secp256r1');
const { randomBytes } = require('crypto');
const { keccak256 } = require("ethers");

const deployContract = async function (contractName, constructorArgs) {
    let factory;
    try {
        factory = await ethers.getContractFactory(contractName);
    } catch (e) {
        factory = await ethers.getContractFactory(contractName + 'UpgradeableWithInit');
    }
    let contract = await factory.deploy(...(constructorArgs || []));
    await contract.waitForDeployment();
    return contract;
};

const generateP256Wallet = function () {
    let privKey;
    do {
        privKey = randomBytes(32);
    } while (!secp256r1.privateKeyVerify(privKey));

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

const _sign = function (msg, privKey) {
    const { signature } = secp256r1.sign(msg, privKey);
    return {
        signature,
        r: "0x" + signature.slice(0, 32).toString("hex"),
        s: "0x" + signature.slice(32, 64).toString("hex"),
    }
};

module.exports = { deployContract, generateP256Wallet };