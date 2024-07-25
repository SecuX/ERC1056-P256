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
        pubKey: "0x" + pubKey.toString("hex"),
        address,
        sign: (msg) => secp256r1.sign(msg, privKey),
    }
}

module.exports = { deployContract, generateP256Wallet };