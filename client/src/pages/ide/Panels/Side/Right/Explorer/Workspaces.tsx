import { useCallback, useMemo } from "react";
import { Atom, useAtom } from "jotai";
import styled from "styled-components";

import Button from "../../../../../../components/Button";
import Text from "../../../../../../components/Text";
import Select from "../../../../../../components/Select";
import {
  NewWorkspace,
  RenameWorkspace,
  DeleteWorkspace,
  ImportGithub,
  ImportFs,
  ImportShared,
} from "./Modals";
import { explorerAtom, modalAtom } from "../../../../../../state";
import {
  ExportFile,
  Github,
  ImportFile,
  ImportWorkspace,
  Info,
  Plus,
  Rename,
  Trash,
} from "../../../../../../components/Icons";
import { PgExplorer, PgModal, PgTutorial } from "../../../../../../utils/pg";

const Workspaces = () => {
  const [explorer] = useAtom(explorerAtom);
  const [, setModal] = useAtom(modalAtom);

  if (explorer?.isShared) return <ShareWarning />;

  const handleNew = () => {
    setModal(<NewWorkspace />);
  };

  const handleRename = () => {
    setModal(<RenameWorkspace />);
  };

  const handleDelete = () => {
    setModal(<DeleteWorkspace />);
  };

  const handleGithub = () => {
    setModal(<ImportGithub />);
  };

  const handleFsImport = () => {
    setModal(<ImportFs />);
  };

  const handleFsExport = async () => {
    try {
      await explorer?.exportWorkspace();
    } catch (e: any) {
      console.log(e.message);
    }
  };

  return (
    <Wrapper>
      <TopWrapper>
        <MainText>Projects</MainText>
        <ButtonsWrapper>
          <Button onClick={handleNew} kind="icon" title="Create">
            <Plus />
          </Button>
          <Button onClick={handleRename} kind="icon" title="Rename">
            <Rename />
          </Button>
          <Button
            onClick={handleDelete}
            kind="icon"
            hoverColor="error"
            title="Delete"
          >
            <Trash />
          </Button>
          <Button onClick={handleGithub} kind="icon" title="Import from Github">
            <Github />
          </Button>
          <Button
            onClick={handleFsImport}
            kind="icon"
            title="Import from local file system"
          >
            <ImportFile />
          </Button>
          <Button onClick={handleFsExport} kind="icon" title="Export">
            <ExportFile />
          </Button>
        </ButtonsWrapper>
      </TopWrapper>
      <WorkspaceSelect />
    </Wrapper>
  );
};

const WorkspaceSelect = () => {
  const [explorer] = useAtom<PgExplorer>(explorerAtom as Atom<PgExplorer>);

  const options = useMemo(
    () => {
      const projects = explorer.allWorkspaceNames!.filter(
        (name) => !PgTutorial.isWorkspaceTutorial(name)
      );
      const tutorials = explorer.allWorkspaceNames!.filter(
        PgTutorial.isWorkspaceTutorial
      );

      const projectOptions = [
        {
          label: "Projects",
          options: projects.map((name) => ({ value: name, label: name })),
        },
      ];
      if (tutorials.length) {
        return projectOptions.concat([
          {
            label: "Tutorials",
            options: tutorials.map((name) => ({ value: name, label: name })),
          },
        ]);
      }

      return projectOptions;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [explorer.currentWorkspaceName]
  );
  const value = useMemo(() => {
    for (const option of options) {
      const val = option.options.find(
        (option) => option.value === explorer.currentWorkspaceName
      );
      if (val) return val;
    }
  }, [explorer.currentWorkspaceName, options]);

  return (
    <SelectWrapper>
      <Select
        options={options}
        value={value}
        onChange={(props) => {
          const newWorkspace = props?.value!;
          if (explorer.currentWorkspaceName !== newWorkspace) {
            explorer.changeWorkspace(newWorkspace);
          }
        }}
      />
    </SelectWrapper>
  );
};

const Wrapper = styled.div`
  margin: 1.5rem 0.5rem 0 0.5rem;
`;

const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const MainText = styled.div`
  color: ${({ theme }) => theme.colors.default.textSecondary};
`;

const ButtonsWrapper = styled.div`
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0 0.5rem;
`;

const SelectWrapper = styled.div`
  & > select {
    width: 100%;
  }
`;

const ShareWarning = () => {
  const handleImport = useCallback(() => PgModal.set(ImportShared), []);

  return (
    <ShareWarningWrapper>
      <Text IconEl={<Info />}>
        <div>This is a shared project, import it to persist changes.</div>
      </Text>
      <Button onClick={handleImport} leftIcon={<ImportWorkspace />} fullWidth>
        Import
      </Button>
    </ShareWarningWrapper>
  );
};

const ShareWarningWrapper = styled.div`
  padding: 1rem 0.5rem;

  & > div:first-child svg {
    color: ${({ theme }) => theme.colors.state.info.color};
  }

  & > button {
    margin-top: 0.75rem;
  }
`;

export default Workspaces;
