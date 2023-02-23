import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import styled from "styled-components";

import Button from "../../../../../../../components/Button";
import DownloadButton from "../../../../../../../components/DownloadButton";
import UploadButton from "../../../../../../../components/UploadButton";
import { buildCountAtom } from "../../../../../../../state";
import {
  PgCommon,
  PgExplorer,
  PgProgramInfo,
  PgTerminal,
  PgWallet,
} from "../../../../../../../utils/pg";

const IDL = () => (
  <Wrapper>
    <Import />
    <Export />
    <InitOrUpgrade />
  </Wrapper>
);

const Import = () => {
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const decodedString = PgCommon.decodeBytes(arrayBuffer);

      PgProgramInfo.update({
        idl: JSON.parse(decodedString),
      });
      await PgExplorer.run({ saveProgramInfo: [] });
    } catch (e: any) {
      console.log(e.message);
    }
  };

  return (
    <UploadButton accept=".json" onUpload={handleUpload} showUploadText>
      Import
    </UploadButton>
  );
};

const Export = () => {
  // Fixes IDL not being updated correctly after a new build
  useAtom(buildCountAtom);

  const idl = PgProgramInfo.getProgramInfo().idl;

  if (!idl) return null;

  return (
    <DownloadButton
      href={PgCommon.getUtf8EncodedString(idl)}
      download="idl.json"
    >
      Export
    </DownloadButton>
  );
};

enum InitOrUpgradeState {
  NO_IDL,
  HAS_ERROR,
  INCORRECT_AUTHORITY,
  IS_FETCHING,
  IS_INITIALIZING,
  IS_UPGRADING,
  CAN_INIT,
  CAN_UPGRADE,
}

const InitOrUpgrade = () => {
  // Check IDL on each build
  const [buildCount] = useAtom(buildCountAtom);

  const [state, setState] = useState<InitOrUpgradeState>(
    InitOrUpgradeState.NO_IDL
  );

  const buttonText = useMemo(() => {
    switch (state) {
      case InitOrUpgradeState.HAS_ERROR:
        return "Retry";
      case InitOrUpgradeState.IS_FETCHING:
        return "Fetching";
      case InitOrUpgradeState.IS_INITIALIZING:
        return "Initializing";
      case InitOrUpgradeState.IS_UPGRADING:
        return "Upgrading";
      case InitOrUpgradeState.CAN_INIT:
        return "Initialize";
      case InitOrUpgradeState.CAN_UPGRADE:
      case InitOrUpgradeState.INCORRECT_AUTHORITY:
        return "Upgrade";
    }
  }, [state]);

  const [loading, disabled] = useMemo(() => {
    switch (state) {
      case InitOrUpgradeState.IS_FETCHING:
      case InitOrUpgradeState.IS_INITIALIZING:
      case InitOrUpgradeState.IS_UPGRADING:
        return [true, true];
      case InitOrUpgradeState.INCORRECT_AUTHORITY:
        return [false, true];
      default:
        return [false, false];
    }
  }, [state]);

  const getIdl = useCallback(async () => {
    try {
      if (!PgProgramInfo.getProgramInfo().idl) {
        setState(InitOrUpgradeState.NO_IDL);
        return;
      }

      setState(InitOrUpgradeState.IS_FETCHING);
      const idlResult = await PgCommon.transition(
        PgProgramInfo.getIdlFromChain()
      );
      if (!idlResult) {
        setState(InitOrUpgradeState.CAN_INIT);
        return;
      }

      const wallet = await PgWallet.get();
      if (idlResult.authority.equals(wallet.publicKey)) {
        setState(InitOrUpgradeState.CAN_UPGRADE);
        return;
      }

      setState(InitOrUpgradeState.INCORRECT_AUTHORITY);
    } catch (e: any) {
      console.log("Couldn't get IDL:", e.message);
      setState(InitOrUpgradeState.HAS_ERROR);
    }
  }, []);

  // Initial run
  useEffect(() => {
    getIdl();
  }, [getIdl, buildCount]);

  const handleInitOrUpgrade = async () => {
    switch (state) {
      case InitOrUpgradeState.CAN_INIT: {
        setState(InitOrUpgradeState.IS_INITIALIZING);
        await PgTerminal.execute({ anchor: "idl init" });
        // TODO: Remove after making command execution async
        await PgCommon.sleep(4000);
        break;
      }
      case InitOrUpgradeState.CAN_UPGRADE: {
        setState(InitOrUpgradeState.IS_UPGRADING);
        await PgTerminal.execute({ anchor: "idl upgrade" });
        // TODO: Remove after making command execution async
        await PgCommon.sleep(2000);
        break;
      }
    }

    await getIdl();
  };

  if (state === InitOrUpgradeState.NO_IDL) return null;

  return (
    <Button
      disabled={disabled}
      btnLoading={loading}
      onClick={handleInitOrUpgrade}
    >
      {buttonText}
    </Button>
  );
};

const Wrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

export default IDL;
