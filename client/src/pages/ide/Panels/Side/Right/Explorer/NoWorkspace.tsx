import { useAtom } from "jotai";
import styled from "styled-components";

import Button from "../../../../../../components/Button";
import Text from "../../../../../../components/Text";
import { NewWorkspace } from "./Modals";
import { modalAtom } from "../../../../../../state";
import { Plus } from "../../../../../../components/Icons";

const NoWorkspace = () => {
  const [, setModal] = useAtom(modalAtom);

  const handleClick = () => {
    setModal(<NewWorkspace />);
  };

  return (
    <Wrapper>
      <Text>Start by creating a new project.</Text>
      <Button
        onClick={handleClick}
        kind="outline"
        fullWidth
        leftIcon={<Plus />}
      >
        Create a new project
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 1.5rem 1rem;
  display: flex;
  justify-content: center;
  flex-direction: column;

  & > button {
    margin-top: 1rem;

    & svg {
      margin-right: 0.5rem !important;
    }
  }
`;

export default NoWorkspace;
