import {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import fs from "fs";

/*
 * First we created a keypair and got a
 * public key and a private key/secret key
 */
var pair;
var secretKey;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getWalletBalance = async (pair, secretKey) => {
    try {
        /** Got a connection to devnet **/
        const connection = new Connection(clusterApiUrl("devnet", "confirm"));
        /** Created a wallet using the secret key  **/
        const myWallet = Keypair.fromSecretKey(secretKey);
        /** The get the balance using base58 value of publickey **/
        const walletBalance = await connection.getBalance(myWallet.publicKey);
        
        return parseInt(walletBalance)/LAMPORTS_PER_SOL;
    } catch (error) {
        console.log(`Error while getting the balanace...\n${error}`);
    }
}

export const getAirdrop = async (pair, secretKey) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet", "confirm"));
        /** Get the wallet using the private key **/
        const walletKeyPair = Keypair.fromSecretKey(secretKey);

        /** Create a transaction to receive airdrop of worth 2SOL using the wallet public key (base58) **/
        const formAirDropSignature = await connection.requestAirdrop(walletKeyPair.publicKey, 2 * LAMPORTS_PER_SOL);
        /** Sign the transaction **/
        await connection.confirmTransaction(formAirDropSignature);
    } catch(err) {
        console.log(`Error while getting error...\n${err}`);
    }
}

export const getUser = async () => {
    const file = "./user.json";
    var userKeyPair;

    fs.readFile(file, "utf8", async (err, data) => {
        if (err) {
            console.log("No user found, creating new user...");
            pair = new Keypair();
            secretKey = pair._keypair.secretKey;
            const userKeyPairJSON = {publicKey: Array.from(pair._keypair.publicKey), secretKey: Array.from(pair._keypair.secretKey)};

            fs.writeFile(file, JSON.stringify(userKeyPairJSON), (err) => {
                if (err) {
                    console.log(`Error writing file...\n${err}`);
                }

                userKeyPair = pair;
            })

        } else {
            console.log("User already exists...");
            data = JSON.parse(data);
            pair = Keypair.fromSecretKey(Uint8Array.from(data.secretKey));
            secretKey = pair._keypair.secretKey;
            userKeyPair = pair;
        }
    })

    await sleep(500);
    return userKeyPair;
}
