import { getUser, getAirdrop, getWalletBalance  } from "./airdrop.mjs";
import readline from "readline-sync";
import web3, { Keypair, PublicKey } from  "@solana/web3.js";

const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
const userWallet = await getUser();
const treasureKeyPair = new Keypair();
const treasurePublicKey = treasureKeyPair._keypair.publicKey;
const userWalletPublicKey = userWallet._keypair.publicKey;
let stakeValue;
let stakeRatio;
let randNum;
let userGuess;


function getRandomNumber(min, max) {
   return Math.floor(Math.random() * (max - min + 1) + min)
}

const transferSOL = async (from, to, fromKeyPair,amount) => {
    await getAirdrop(treasureKeyPair, treasureKeyPair._keypair.secretKey);
    let transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports: amount*web3.LAMPORTS_PER_SOL
        })
    )

    const signature = await web3.sendAndConfirmTransaction(connection, transaction, [fromKeyPair]);
    return signature;
}

const startGame = async () => {
    console.log("-- Welcome to SOL Stake --");
    console.log("-- Max bidding amount is 2SOL --\n")
    while(true) {
        console.log("Enter the amount of sol you want to stake. (max 2 SOL)");
        stakeValue = Number(readline.question());

        if (stakeValue <= 2) {
            break;
        }
    }
    console.log("Enter the ratio of staking (format => x:y)");
    stakeRatio = String(readline.question()).split(":");

    console.log(`\nYou will have to pay ${stakeValue} SOL`);
    let reward = stakeValue*parseInt(stakeRatio[1]).toFixed(2);
    console.log(`\n### You will get ${reward} SOL if you guess correct ###\n`);

    randNum = getRandomNumber(1, 5);
    console.log("Enter a number between 1 to 5, (1 and 5 are included)");
    userGuess = Number(readline.question());

    const gameSignature = await transferSOL(userWallet.publicKey, treasureKeyPair.publicKey, userWallet, stakeValue);
    console.log(`\nSignature of staking is ${gameSignature}\n`);

    if (userGuess === randNum) {
        console.log(`You guessed it right!!\n`);
        console.log(`${reward} SOL will be transfered to your wallet => ${userWallet.publicKey.toString()}`);
        const signature = await transferSOL(treasureKeyPair.publicKey, userWallet.publicKey, treasureKeyPair, reward);   
        console.log(`\nSignature of winning is ${signature}`);
    } else {
        console.log(`Sorry...You guessed wrong, ${randNum} is the correct number`);
    }
}

startGame();
