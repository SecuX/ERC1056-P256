const { EthrDidController, stringToBytes32 } = require("ethr-did-resolver");
const { SigningKey, Wallet } = require("ethers");
const { config } = require("hardhat");
const { expect } = require("chai");
const { deployContract, generateP256Wallet } = require("./helpers.js");

describe("ERC1056_P256", async function () {
    beforeEach(async function () {
        const [addr1, addr2] = await ethers.getSigners();
        this.addr1 = addr1;
        this.addr2 = addr2;

        const accounts = config.networks.hardhat.accounts;
        const wallet1 = Wallet.fromPhrase(accounts.mnemonic, `${accounts.path}/0`);
        this.addr1Signer = new SigningKey(wallet1.privateKey);

        this.p256Signer = generateP256Wallet();

        this.erc1056_p256 = await deployContract("ERC1056P256");
        this.ethrDID = new EthrDidController(
            addr1.address,
            this.erc1056_p256,
        );
    });

    describe("Delegate", function () {
        it("can add delegate", async function () {
            const delegateType = "veriKey";
            const delegateTypeBytes = stringToBytes32(delegateType);
            const delegate = this.p256Signer.address;
            const exp = 86400;
            const hash = await this.ethrDID.createAddDelegateHash(delegateType, delegate, exp);
            const signature = this.addr1Signer.sign(hash);

            await this.erc1056_p256.connect(this.addr1).addDelegateSigned(
                this.addr1.address,
                signature.v,
                signature.r,
                signature.s,
                delegateTypeBytes,
                delegate,
                exp,
            );

            await expect(
                this.erc1056_p256.validDelegate(
                    this.addr1.address,
                    delegateTypeBytes,
                    delegate,
                )
            ).to.eventually.true;
        });
    });
});