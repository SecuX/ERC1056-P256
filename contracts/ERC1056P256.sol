// SPDX-License-Identifier: MIT
// Creator: SecuX
pragma solidity ^0.8.24;

import "ethr-did-registry/contracts/EthereumDIDRegistry.sol";

contract ERC1056P256 is EthereumDIDRegistry {
    address constant P256 = 0x0000000000000000000000000000000000000100;

    function P256VERIFY(bytes32 hash, bytes32 sigR, bytes32 sigS, bytes32 x, bytes32 y) internal returns(bool) {
        bytes memory input = abi.encodePacked(hash, sigR, sigS, x, y);
        (bool success, bytes memory output) = P256.staticcall(input);
        require(success, "p256 not supported");
        return abi.decode(output, (bool));
    }

    function checkSignature(address identity, bytes32 sigR, bytes32 sigS, bytes32 x, bytes32 y, bytes32 hash) internal returns(address) {
        bool isValidSignature = P256VERIFY(hash, sigR, sigS, x, y);
        require(isValidSignature, "bad_signature");

        address signer = address(bytes20(keccak256(abi.encodePacked(x, y))));
        require(signer == identityOwner(identity), "bad_signature");
        nonce[signer]++;
        return signer;
    }

    function changeOwnerSigned(address identity, bytes32 sigR, bytes32 sigS, bytes32 x, bytes32 y, address newOwner) public {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "changeOwner", newOwner));
        changeOwner(identity, checkSignature(identity, sigR, sigS, x, y, hash), newOwner);
    }

    function addDelegateSigned(address identity, bytes32 sigR, bytes32 sigS, bytes32 x, bytes32 y, bytes32 delegateType, address delegate, uint validity) public {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "addDelegate", delegateType, delegate, validity));
        addDelegate(identity, checkSignature(identity, sigR, sigS, x, y, hash), delegateType, delegate, validity);
    }

    function revokeDelegateSigned(address identity, bytes32 sigR, bytes32 sigS, bytes32 x, bytes32 y, bytes32 delegateType, address delegate) public {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "revokeDelegate", delegateType, delegate));
        revokeDelegate(identity, checkSignature(identity, sigR, sigS, x, y, hash), delegateType, delegate);
    }

    function setAttributeSigned(address identity, bytes32 sigR, bytes32 sigS, bytes32 x, bytes32 y, bytes32 name, bytes memory value, uint validity) public {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "setAttribute", name, value, validity));
        setAttribute(identity, checkSignature(identity, sigR, sigS, x, y, hash), name, value, validity);
    }

    function revokeAttributeSigned(address identity, bytes32 sigR, bytes32 sigS, bytes32 x, bytes32 y, bytes32 name, bytes memory value) public {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0x19), bytes1(0), this, nonce[identityOwner(identity)], identity, "revokeAttribute", name, value));
        revokeAttribute(identity, checkSignature(identity, sigR, sigS, x, y, hash), name, value);
    }
}
