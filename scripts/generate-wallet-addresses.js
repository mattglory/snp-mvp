// Generate wallet addresses from mnemonics
import bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import { addressFromPublicKeys, AddressVersion } from '@stacks/transactions';

const mnemonics = [
  { name: "wallet_1", mnemonic: "point approve language letter cargo rough similar wrap focus edge polar task olympic tobacco windy upper sea oil crucial phone arrow repeat night speed" },
  { name: "wallet_2", mnemonic: "song trust venture topic web notable task latin survey orphan area tube device arm infant syrup whisper milk fresh cage note loud differ casino" },
  { name: "wallet_3", mnemonic: "replace swing average piece strong crowd dust can work soul animal fantasy high emotion torch gravity melt quality novel diamond detail mesh siren ability" },
  { name: "wallet_4", mnemonic: "venture fitness paper little blush april rigid where find volcano fetch crack label polar dash kind essence blue tooth swamp text nut jazz" },
  { name: "wallet_5", mnemonic: "draft shoe orphan estate afford weasel reform burden lake certain quote process merit glide above tuna twist glow grief north dragon tornado silk" },
  { name: "wallet_6", mnemonic: "spin critic soup dice essay cricket orient gift goat cradle panel absurd height alpha parent loud produce reflect april advance meadow abandon cube" },
  { name: "wallet_7", mnemonic: "quality vacuum heart guard buzz spike sight universe soldier dump glare position scout opera banner buffalo notable swift oxygen ketchup robust room gift" },
  { name: "wallet_8", mnemonic: "bulk obtain turtle census divorce mountain claim device antenna mirror rebel all fabric deny hover genius oxygen parent degree vehicle retreat sentence wing" },
  { name: "wallet_9", mnemonic: "proof cart practice vendor relief stove chronic adult produce debate total behave desert keen moment decade position fuel bird carpet tiny ranch exile" },
  { name: "wallet_10", mnemonic: "dismiss belt region glove recall cruise multiply donor raw wrist cricket giraffe wrap hammer float broccoli huge turtle oval journey napkin exclude acid" },
];

function deriveAddress(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const master = HDKey.fromMasterSeed(seed);

  // Stacks derivation path: m/44'/5757'/0'/0/0
  const child = master.derive("m/44'/5757'/0'/0/0");
  const publicKey = child.publicKey;

  // Generate testnet address
  const address = addressFromPublicKeys(
    AddressVersion.TestnetSingleSig,
    {publicKeys: [publicKey], numSignaturesRequired: 1}
  );

  return address.address;
}

console.log("Generating wallet addresses...\n");

for (const { name, mnemonic } of mnemonics) {
  try {
    const address = deriveAddress(mnemonic);
    console.log(`    - name: ${name}`);
    console.log(`      address: ${address}`);
    console.log(`      balance: "100000000000000"`);
  } catch (error) {
    console.error(`Error generating ${name}:`, error.message);
  }
}
