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

    describe("secp256k1 Signer", function () {
        beforeEach(async function () {
            this.delegateType = "veriKey";
            this.delegateTypeBytes = stringToBytes32(this.delegateType);
            this.delegate = this.p256Signer.address;
            this.exp = 86400;
        });

        it("can add delegate", async function () {
            const hash = await this.ethrDID.createAddDelegateHash(this.delegateType, this.delegate, this.exp);
            const signature = this.addr1Signer.sign(hash);

            await this.erc1056_p256.connect(this.addr1).addDelegateSigned(
                this.addr1.address,
                signature.v,
                signature.r,
                signature.s,
                this.delegateTypeBytes,
                this.delegate,
                this.exp,
            );

            await expect(
                this.erc1056_p256.validDelegate(
                    this.addr1.address,
                    this.delegateTypeBytes,
                    this.delegate,
                )
            ).to.eventually.true;
        });
    });

    describe("P256 Signer", function () {
        beforeEach(async function () {
            this.delegateType = "veriKey";
            this.delegateTypeBytes = stringToBytes32(this.delegateType);
            this.delegate = this.p256Signer.address;
            this.attrName = "did/pub/secp256r1/veriKey";
            this.attrValue = this.p256Signer.pubKey.value;
            this.exp = 86400;

            await this.erc1056_p256.connect(this.addr1).changeOwner(
                this.addr1.address,
                this.p256Signer.address,
            );

            this.addDelegate = async () => {
                const hash = await this.ethrDID.createAddDelegateHash(this.delegateType, this.delegate, this.exp);
                const signature = this.p256Signer.sign(hash);

                await this.erc1056_p256.connect(this.addr1).addDelegateSigned(
                    this.addr1.address,
                    signature.r,
                    signature.s,
                    this.p256Signer.pubKey.x,
                    this.p256Signer.pubKey.y,
                    this.delegateTypeBytes,
                    this.delegate,
                    this.exp,
                    {}
                );
            };

            this.setAttribute = async () => {
                const hash = await this.ethrDID.createSetAttributeHash(this.attrName, this.attrValue, this.exp);
                const signature = this.p256Signer.sign(hash);

                await this.erc1056_p256.connect(this.addr1).setAttributeSigned(
                    this.addr1.address,
                    signature.r,
                    signature.s,
                    this.p256Signer.pubKey.x,
                    this.p256Signer.pubKey.y,
                    stringToBytes32(this.attrName),
                    this.attrValue,
                    this.exp,
                    {}
                );
            };
        });

        it("can chage owner", async function () {
            const hash = await this.ethrDID.createChangeOwnerHash(this.delegate);
            const signature = this.p256Signer.sign(hash);

            await this.erc1056_p256.connect(this.addr1).changeOwnerSigned(
                this.addr1.address,
                signature.r,
                signature.s,
                this.p256Signer.pubKey.x,
                this.p256Signer.pubKey.y,
                this.delegate,
                {}
            );
        });

        it("can add delegate", async function () {
            await this.addDelegate();

            await expect(
                this.erc1056_p256.validDelegate(
                    this.addr1.address,
                    this.delegateTypeBytes,
                    this.delegate,
                )
            ).to.eventually.true;
        });

        it("can revoke delegate", async function () {
            await this.addDelegate();

            const hash = await this.ethrDID.createRevokeDelegateHash(this.delegateType, this.delegate);
            const signature = this.p256Signer.sign(hash);

            await this.erc1056_p256.connect(this.addr1).revokeDelegateSigned(
                this.addr1.address,
                signature.r,
                signature.s,
                this.p256Signer.pubKey.x,
                this.p256Signer.pubKey.y,
                this.delegateTypeBytes,
                this.delegate,
                {}
            );

            await expect(
                this.erc1056_p256.validDelegate(
                    this.addr1.address,
                    this.delegateTypeBytes,
                    this.delegate,
                )
            ).to.eventually.false;
        });

        it("can set attribute", async function () {
            await this.setAttribute();
        });

        it("can revoke attribute", async function () {
            await this.setAttribute();

            const hash = await this.ethrDID.createRevokeAttributeHash(this.attrName, this.attrValue);
            const signature = this.p256Signer.sign(hash);

            await this.erc1056_p256.connect(this.addr1).revokeAttributeSigned(
                this.addr1.address,
                signature.r,
                signature.s,
                this.p256Signer.pubKey.x,
                this.p256Signer.pubKey.y,
                stringToBytes32(this.attrName),
                this.attrValue,
                {}
            );
        });
    });
});