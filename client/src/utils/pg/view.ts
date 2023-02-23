import { EventName } from "../../constants";
import { PgCommon } from "./common";
import { PgDisposable, PgSet, SetElementAsync } from "./types";

export enum Sidebar {
  CLOSED = "Closed",
  EXPLORER = "Explorer",
  // SEARCH = "Search",
  BUILD_DEPLOY = "Build & Deploy",
  TEST = "Test",
  TUTORIALS = "Tutorials",
  GITHUB = "Github",
  WALLET = "Wallet",
  SETTINGS = "Settings",
}

export class PgView {
  /**
   * Set main view(next to the sidebar and above the terminal)
   *
   * @param SetEl element to set the main view to. (default: Editor)
   */
  static async setMain(SetEl?: SetElementAsync) {
    while (1) {
      try {
        const eventNames = PgCommon.getStaticStateEventNames(
          EventName.VIEW_MAIN_STATIC
        );
        const result = await PgCommon.timeout(
          PgCommon.sendAndReceiveCustomEvent(eventNames.get)
        );
        if (result) {
          PgCommon.createAndDispatchCustomEvent(eventNames.set, SetEl);
          break;
        }
      } catch {
        await PgCommon.sleep(1000);
      }
    }
  }

  /**
   * Set the current sidebar state
   *
   * @param state sidebar state to set
   */
  static setSidebarState(state: PgSet<Sidebar>) {
    PgCommon.createAndDispatchCustomEvent(
      EventName.VIEW_SIDEBAR_STATE_SET,
      state
    );
  }

  /**
   * Runs after changing sidebar state
   *
   * @param cb callback function to run after changing sidebar page
   * @returns a dispose function to clear the event
   */
  static onDidChangeSidebarState(cb: (state: Sidebar) => any): PgDisposable {
    const handle = (e: UIEvent & { detail: { state: Sidebar } }) => {
      cb(e.detail.state);
    };

    document.addEventListener(
      EventName.VIEW_ON_DID_CHANGE_SIDEBAR_STATE,
      handle as EventListener
    );
    return {
      dispose: () =>
        document.removeEventListener(
          EventName.VIEW_ON_DID_CHANGE_SIDEBAR_STATE,
          handle as EventListener
        ),
    };
  }
}
