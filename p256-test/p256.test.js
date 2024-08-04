const { default: Axios } = require("axios");
const { sha256 } = require("hash.js");
const chai = require("chai");
const { expect } = chai;

// URL of the Wycheproof test vectors
const vectorsUrl = "https://raw.githubusercontent.com/C2SP/wycheproof/master/testvectors/ecdsa_secp256r1_sha256_p1363_test.json";
// URL of p256 verify api
const serviceUrl = "https://uat.secuxtech.com/scm/P256VERIFY";

describe("Wycheproof secp256r1 Tests", function () {
	let vectors;

	// Fetch the JSON before running the tests
	before(async function () {
		const response = await Axios.get(vectorsUrl);
		vectors = response.data;

		describe('ECDSA secp256r1 Tests', function () {
			vectors.testGroups.forEach(group => {
				const { uncompressed } = group.key;
				const x = "0x" + uncompressed.slice(2, 64 + 2);
				const y = "0x" + uncompressed.slice(2 + 64, 2 + 128);

				group.tests.forEach(test => {
					const { tcId, comment, msg, sig, result } = test;
					const hash = "0x" + sha256().update(msg, "hex").digest("hex");
					const r = "0x" + sig.slice(0, 64);
					const s = "0x" + sig.slice(64, 128);

					it(`Test case ${tcId}: ${comment}`, async function () {
						try {
							const response = await Axios.post(serviceUrl, {
								contractType: "precompiled",
								params: { hash, r, s, x, y }
							});

							if (result === 'valid') {
								expect(response.data).to.be.true;
							} 
							else {
								expect(response.data).to.be.false;
							}
						} 
						catch (error) {
							if (result === 'valid') {
								throw new Error(`Unexpected error for test case ${tcId}: ${error.message}`);
							}
						}
					});
				});
			});
		});
	});

	it('should load the test vectors', function () {
		expect(vectors).to.be.an('object');
		expect(vectors.testGroups).to.be.an('array');
	});
});