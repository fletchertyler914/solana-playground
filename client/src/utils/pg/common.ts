import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ChangeEvent } from "react";

import { Endpoint, EXPLORER_URL, SOLSCAN_URL } from "../../constants";

export class PgCommon {
  /**
   * @param ms amount of time to sleep in ms
   * @returns a promise that will resolve after specified ms
   */
  static async sleep(ms: number = 300) {
    return new Promise((res) => setTimeout((s) => res(s), ms));
  }

  /**
   * Wait at least `ms` amount of miliseconds before resolving
   *
   * @param promise promise to await
   * @returns the result of the promise parameter
   */
  static async transition<P>(
    promise: Promise<P>,
    ms?: number
  ): Promise<Awaited<P>> {
    const result = (await Promise.allSettled([this.sleep(ms), promise]))[1];
    if (result.status === "fulfilled") {
      return result.value;
    }

    throw new Error(result.reason?.message);
  }

  /**
   * Wait at least `ms` amount of miliseconds before timing out
   *
   * @param promise promise to await
   * @returns the result of the promise parameter
   */
  static async timeout<P>(
    promise: Promise<P>,
    ms?: number
  ): Promise<P | undefined> {
    try {
      return (await Promise.race([
        new Promise((_, rej) => this.sleep(ms).then(rej)),
        promise,
      ])) as Awaited<P>;
    } catch {
      console.log("Timed out");
    }
  }

  /**
   * Try the callback until the return value of the callback is a non-falsy value.
   *
   * NOTE: Only use this function if you are certain the return value of the
   * callback will eventually be a non-falsy value. It's not a good idea to use
   * this function when the return value can be a falsy value due to possible
   * infinite loop from this function.
   *
   * @param cb callback function to try
   * @param tryInterval optional try interval
   * @returns the non-nullable return value of the callback
   */
  static async tryUntilSuccess<T>(
    cb: () => Promise<T>,
    tryInterval: number = 1000
  ) {
    let returnValue: T;
    while (1) {
      returnValue = await cb();
      if (returnValue) break;

      await this.sleep(tryInterval);
    }

    return returnValue!;
  }

  /**
   * @returns the decoded string
   */
  static decodeBytes(
    b: ArrayBuffer | Buffer | Uint8Array,
    type: string = "utf-8"
  ) {
    const decoder = new TextDecoder(type);
    const decodedString = decoder.decode(b);

    return decodedString;
  }

  /**
   * Check whether the http response is OK.
   * If there is an error, decode the array buffer and return it.
   *
   * @returns response array buffer if the response is OK
   */
  static async checkForRespErr(resp: Response) {
    const arrayBuffer = await resp.arrayBuffer();

    if (!resp.ok) throw new Error(this.decodeBytes(arrayBuffer));

    return arrayBuffer;
  }

  /**
   * @returns first and last (default: 5) chars of a public key and '...' in between as string
   */
  static shortenPk(pk: PublicKey | string, chars: number = 5) {
    const pkStr = typeof pk === "object" ? pk.toBase58() : pk;
    return `${pkStr.slice(0, chars)}...${pkStr.slice(-chars)}`;
  }

  /**
   * @returns lamports amount to equivalent Sol
   */
  static lamportsToSol(lamports: number) {
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * @returns Sol amount to equivalent lamports
   */
  static solToLamports(sol: number) {
    return sol * LAMPORTS_PER_SOL;
  }

  /**
   * Compare values by `JSON.stringify`
   */
  static compareValues(val1: any, val2: any) {
    return JSON.stringify(val1) === JSON.stringify(val2);
  }

  /**
   * @returns the JS number(only use it if you are certain this won't overflow)
   */
  static bigintToInt<T extends bigint | undefined>(bigint: T) {
    return (
      bigint?.toString() ? +bigint.toString() : undefined
    ) as T extends bigint ? number : undefined;
  }

  /**
   * Convert seconds into human readable string format
   */
  static secondsToTime(secs: number) {
    const d = Math.floor(secs / (60 * 60 * 24)),
      h = Math.floor((secs % (60 * 60 * 24)) / (60 * 60)),
      m = Math.floor((secs % (60 * 60)) / 60),
      s = Math.floor(secs % 60);

    if (d) return `${d}d`;
    if (h) return `${h}h`;
    if (m) return `${m}m`;
    if (s) return `${s}s`;

    return "";
  }

  /**
   * @returns the current UNIX timestamp(sec)
   */
  static getUnixTimstamp() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * @returns utf-8 encoded string from the arg
   */
  static getUtf8EncodedString(object: object) {
    return (
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(object))
    );
  }

  /**
   * Get the cluster URL parameter to add to the explorer URL(s)
   *
   * @returns the cluster URL suffix
   */
  static getExplorerClusterParam(endpoint: string) {
    // Mainnet by default
    let cluster = "";

    if (endpoint === Endpoint.LOCALHOST) {
      cluster = "?cluster=custom&customUrl=" + Endpoint.LOCALHOST;
    } else if (
      endpoint === Endpoint.DEVNET ||
      endpoint === Endpoint.DEVNET_GENESYSGO
    ) {
      cluster = "?cluster=devnet";
    } else if (endpoint === Endpoint.TESTNET) {
      cluster = "?cluster=testnet";
    }

    return cluster;
  }

  /**
   * Get transaction urls for explorers
   *
   * @returns transaction url for solana explorer, solscan
   */
  static getExplorerTxUrls(txHash: string, endpoint: Endpoint) {
    let explorer = EXPLORER_URL + "/tx/" + txHash;
    const cluster = this.getExplorerClusterParam(endpoint);
    explorer += cluster;

    // Solscan doesn't have support for localhost
    if (endpoint === Endpoint.LOCALHOST) {
      return { explorer };
    }

    const solscan = SOLSCAN_URL + "/tx/" + txHash + cluster;

    return { explorer, solscan };
  }

  /**
   *  Get explorer urls for a mint
   *
   * @returns mint url for solana explorer, solscan
   */
  static getExplorerTokenUrl(mint: string, endpoint: string) {
    let explorer = EXPLORER_URL + "/address/" + mint;
    const cluster = this.getExplorerClusterParam(endpoint);
    explorer += cluster;

    // Solscan doesn't have support for localhost
    if (endpoint === Endpoint.LOCALHOST) {
      return { explorer };
    }

    const solscan = SOLSCAN_URL + "/token/" + mint + cluster;

    return { explorer, solscan };
  }

  /**
   * Calculate basic rem operations for css
   */
  static calculateRem(
    remOne: string,
    remTwo: string,
    operation: "add" | "substract"
  ) {
    const intOne = +remOne.split("rem")[0];
    const intTwo = +remTwo.split("rem")[0];

    let result;

    if (operation === "add") result = intOne + intTwo;
    else if (operation === "substract") result = intOne - intTwo;

    return result + "rem";
  }

  /**
   * @returns true if the pressed key is `Ctrl` or `Cmd`
   */
  static isKeyCtrlOrCmd(e: globalThis.KeyboardEvent) {
    return e.ctrlKey || e.metaKey;
  }

  /**
   * @returns true if the OS is Mac
   */
  static isMac() {
    const macPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
    let isMac = false;
    for (const mac of macPlatforms) {
      if (window.navigator.userAgent.includes(mac)) {
        isMac = true;
        break;
      }
    }

    return isMac;
  }

  /**
   * Changes `Ctrl` to `Cmd` if the OS is Mac
   */
  static getKeybindTextOS(text: string) {
    if (this.isMac()) {
      text = text.replace("Ctrl", "Cmd");
    }
    return text;
  }

  /**
   * @returns whether the browser is Firefox
   */
  static isFirefox() {
    return window.navigator.userAgent.includes("Firefox");
  }

  /**
   * @returns camelCase converted version of the string input
   */
  static toCamelCase(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  /**
   * @returns kebab-case converted version of the string input(works with Title Case)
   */
  static toKebabCase(str: string) {
    return str
      .split(" ")
      .map((w) => w.toLowerCase())
      .join("-");
  }

  /**
   * @returns automatic airdrop amount
   */
  static getAirdropAmount(endpoint: string) {
    switch (endpoint) {
      case Endpoint.PLAYNET:
        return 1000;
      case Endpoint.LOCALHOST:
        return 100;
      case Endpoint.DEVNET:
        return 2;
      case Endpoint.TESTNET:
        return 1;
      default:
        return null;
    }
  }

  /**
   * Dispatch a custom DOM event
   *
   * @param name custom event name
   * @param detail data to send with the custom event
   */
  static createAndDispatchCustomEvent<T>(name: string, detail?: T) {
    const customEvent = new CustomEvent(name, { detail });
    document.dispatchEvent(customEvent);
  }

  /**
   * Get send and receive event names
   *
   * @param eventName name of the custom event
   * @returns names of the send and receive
   */
  static getSendAndReceiveEventNames(eventName: string) {
    const send = eventName + "send";
    const receive = eventName + "receive";
    return { send, receive };
  }

  /**
   * Get static get and run event names
   *
   * @param eventName name of the custom event
   * @returns names of the get and run
   */
  static getStaticEventNames(eventName: string) {
    const get = eventName + "get";
    const run = eventName + "run";
    return { get, run };
  }

  /**
   * Get static get and set event names
   *
   * @param eventName name of the custom event
   * @returns names of the get and set
   */
  static getStaticStateEventNames(eventName: string) {
    const get = eventName + "get";
    const set = eventName + "set";
    return { get, set };
  }

  /**
   * Dispatch a custom event and wait for receiver to resolve
   *
   * @param eventName name of the custom event
   * @param data data to send
   * @returns the resolved data
   */
  static async sendAndReceiveCustomEvent<A, R>(
    eventName: string,
    data?: A
  ): Promise<R> {
    const eventNames = this.getSendAndReceiveEventNames(eventName);

    // Send data
    this.createAndDispatchCustomEvent(eventNames.send, data);

    // Wait for data
    return new Promise((res, rej) => {
      const handleReceive = (
        e: UIEvent & { detail: { data: R; error?: string } }
      ) => {
        document.removeEventListener(
          eventNames.receive,
          handleReceive as EventListener
        );

        if (e.detail.error) {
          rej({ message: e.detail.error });
        } else {
          res(e.detail.data);
        }
      };

      document.addEventListener(
        eventNames.receive,
        handleReceive as EventListener
      );
    });
  }

  /**
   * Runs `setInterval` callback function only when the document has focus
   *
   * @param cb callback to run on interval
   * @param ms interval time amount in miliseconds
   * @returns a cleanup timer that should be called with `clearInterval`
   */
  static setIntervalOnFocus(cb: () => void, ms?: number) {
    return setInterval(() => {
      if (document.hasFocus()) cb();
    }, ms);
  }

  /**
   * Import file(s) from the user's file system
   *
   * @param onChange callback function to run when file input has changed
   * @param opts optional options
   */
  static import(
    onChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>,
    opts?: { accept?: string; dir?: boolean }
  ) {
    const el = document.createElement("input");
    el.type = "file";
    if (opts?.accept) el.accept = opts.accept;

    const dirProps = opts?.dir
      ? {
          webkitdirectory: "",
          mozdirectory: "",
          directory: "",
          multiple: true,
        }
      : {};
    for (const key in dirProps) {
      // @ts-ignore
      el[key] = dirProps[key as keyof typeof dirProps];
    }

    // @ts-ignore
    el.onchange = onChange;

    el.click();
  }

  /**
   * Export the content as a file
   *
   * @param name name of the exported file
   * @param content content of the exported file
   */
  static export(name: string, content: string) {
    const el = document.createElement("a");
    el.download = name;
    el.href = content;
    el.click();
  }

  /**
   * Make a noun plural
   *
   * @param noun name of the noun
   * @param length item length that will decide whether to make the noun plural
   * @param plural plural version of the name for irregular suffixes
   * @returns plural version of the noun
   */
  static makePlural(noun: string, length: number, plural?: string) {
    if (length > 1) return plural ?? noun + "s";
    return noun;
  }

  /**
   * Convert objects into pretty JSON strings
   *
   * @param obj json object
   * @returns prettified string output
   */
  static prettyJSON(obj: object) {
    return JSON.stringify(obj, null, 2);
  }

  /**
   * Get human readable date time from unix timestamp
   *
   * @param unixTs unix timestamp in seconds
   * @param opts date format options
   * @returns formatted date string
   */
  static getFormattedDateFromUnixTimestamp(
    unixTs: number,
    opts?: {
      locale: string;
    } & Pick<Intl.DateTimeFormatOptions, "dateStyle" | "timeStyle" | "timeZone">
  ) {
    return new Intl.DateTimeFormat(opts?.locale ?? "en-US", {
      dateStyle: opts?.dateStyle ?? "full",
      timeStyle: opts?.timeStyle ?? "long",
      timeZone: opts?.timeZone ?? "UTC",
    }).format(unixTs * 1e3);
  }

  /**
   * Append '/' to the end of the string
   *
   * @param str string to append slash to
   * @returns the slash appended string
   */
  static appendSlash(str: string) {
    if (!str) return "";
    return str + (str.endsWith("/") ? "" : "/");
  }

  /**
   * Get the string without '/' prefix
   *
   * @param str string input
   * @returns the string without slash prefix
   */
  static withoutPreSlash(str: string) {
    return str[0] === "/" ? str.substring(1) : str;
  }

  /**
   * Join the paths without caring about incorrect '/' inside paths
   *
   * @param paths paths to join
   * @returns the joined path
   */
  static joinPaths(paths: string[]) {
    return paths.reduce(
      (acc, cur) => this.appendSlash(acc) + this.withoutPreSlash(cur)
    );
  }

  /**
   * Adds space before the string, mainly used for terminal output
   *
   * @param str string to prepend spaces to
   * @param opts -
   * - addSpace: add space before or after the string
   * - repeat: repeat the string `repeat.amount` times
   * @returns the space prepended string
   */
  static string(
    str: string,
    opts: {
      addSpace?: {
        amount: number;
        type?: "total" | "additional";
        position?: "left" | "right";
      };
      repeat?: { amount: number };
    }
  ) {
    if (opts.addSpace) {
      const space = this._repeatPattern(
        " ",
        opts.addSpace.amount -
          (opts.addSpace.type === "additional" ? 0 : str.length)
      );
      return opts.addSpace.position === "right" ? str + space : space + str;
    }
    if (opts.repeat) {
      return this._repeatPattern(str, opts.repeat.amount);
    }
  }

  private static _repeatPattern(pattern: string, amount: number) {
    return new Array(amount >= 0 ? amount : 0)
      .fill(null)
      .reduce((acc) => acc + pattern, "");
  }
}
