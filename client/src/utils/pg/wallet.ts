import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as ed25519 from "@noble/ed25519";

import { PgTerminal } from "./terminal/";
import { PgCommon } from "./common";
import { EventName } from "../../constants";
import { PgSet } from "./types";

/** localStorage data for the wallet */
interface LsWallet {
  /** Whether the user accepted the initial setup pop-up */
  setupCompleted: boolean;
  /** Whether the wallet is in connected */
  connected: boolean;
  /**
   * ed25519 secret key(keypair).
   * First 32 bytes are the private key, last 32 bytes are the public key.
   *
   * NOTE: `Array` type is intentionally used as `Uint8Array` and `Buffer` are
   * causing problems while saving to localStorage.
   */
  sk: Array<number>;
}

/**
 * A wallet that can be used as a replacement for `AnchorWallet`.
 *
 * This implementation allows playground to not have to wait for user confirmation
 * for transactions.
 */
export class PgWallet implements AnchorWallet {
  /** Keypair of the wallet */
  private _kp: Keypair;

  /**
   * Public key of the current wallet.
   *
   * NOTE: This will always be set, even when the wallet is not connected.
   */
  publicKey: PublicKey;
  /**
   * Connected state of the wallet
   */
  connected: boolean;

  constructor() {
    let lsWallet = PgWallet.getLs();
    if (!lsWallet) {
      lsWallet = PgWallet._DEFAULT_LS_WALLET;
      PgWallet.update(PgWallet._DEFAULT_LS_WALLET);
    }

    this._kp = Keypair.fromSecretKey(new Uint8Array(lsWallet.sk));
    this.publicKey = this._kp.publicKey;
    this.connected = lsWallet.connected;
  }

  /**
   * Get the keypair of the wallet.
   *
   * NOTE: Direct use of this should be avoided when possible. This is made public
   * to give access for the users in code client.
   */
  get keypair() {
    return this._kp;
  }

  /**
   * Sign all transactions.
   *
   * @param tx transaction to sign
   * @returns the signed transaction
   *
   * NOTE: The API is async to make the types compatible with `AnchorWallet`
   */
  async signTransaction(tx: Transaction) {
    tx.partialSign(this.keypair);
    return tx;
  }

  /**
   * Sign all transactions.
   *
   * @param txs transactions to sign
   * @returns the signed transactions
   *
   * NOTE: The API is async to make the types compatible with `AnchorWallet`
   */
  async signAllTransactions(txs: Transaction[]) {
    for (const tx of txs) {
      tx.partialSign(this.keypair);
    }

    return txs;
  }

  /**
   * Sign an arbitrary message
   *
   * @param message message to sign
   * @returns signature of the signed message
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return await ed25519.sign(message, this.keypair.secretKey.slice(0, 32));
  }

  // Statics

  static get keypairBytes() {
    return Uint8Array.from(PgWallet.getKp().secretKey);
  }

  /**
   * @returns wallet info from localStorage
   */
  static getLs() {
    const lsWalletStr = localStorage.getItem(PgWallet._WALLET_KEY);
    if (!lsWalletStr) return null;

    const lsWallet: LsWallet = JSON.parse(lsWalletStr);
    return lsWallet;
  }

  /**
   * Update localStorage wallet
   */
  static update(updateParams: Partial<LsWallet>) {
    const lsWallet = PgWallet.getLs() ?? PgWallet._DEFAULT_LS_WALLET;

    if (updateParams.setupCompleted !== undefined)
      lsWallet.setupCompleted = updateParams.setupCompleted;
    if (updateParams.connected !== undefined)
      lsWallet.connected = updateParams.connected;
    if (updateParams.sk) lsWallet.sk = updateParams.sk;

    localStorage.setItem(PgWallet._WALLET_KEY, JSON.stringify(lsWallet));
  }

  /**
   * @returns wallet keypair from localStorage
   */
  static getKp() {
    return Keypair.fromSecretKey(new Uint8Array(PgWallet.getLs()!.sk));
  }

  /**
   * Check whether Pg wallet is connected.
   * If not, print connect instructions in terminal.
   *
   * @returns `true` if Pg wallet is connected
   */
  static checkIsPgConnected() {
    if (PgWallet.getLs()?.connected) return true;

    PgTerminal.log(
      `${PgTerminal.bold(
        "Playground Wallet"
      )} must be connected to run this command. Run ${PgTerminal.bold(
        "connect"
      )} to connect.`
    );

    return false;
  }

  /**
   * Statically get the wallet object from state
   *
   * @returns the wallet object
   */
  static async get<T, R extends PgWallet>() {
    return await PgCommon.sendAndReceiveCustomEvent<T, R>(
      PgCommon.getStaticEventNames(EventName.WALLET_STATIC).get
    );
  }

  /**
   * Set the wallet balance in the UI
   *
   * @param balance setBalance type function
   */
  static setUIBalance(balance: PgSet<number | null>) {
    PgCommon.createAndDispatchCustomEvent(
      EventName.WALLET_UI_BALANCE_SET,
      balance
    );
  }

  /** localStorage key for the wallet */
  private static readonly _WALLET_KEY = "wallet";

  /** Randomly generated default localStorage wallet */
  private static readonly _DEFAULT_LS_WALLET: LsWallet = {
    setupCompleted: false,
    connected: false,
    sk: Array.from(Keypair.generate().secretKey),
  };
}
