import { useAtom } from "jotai";
import styled, { css } from "styled-components";

import { uiBalanceAtom } from "../../../../state";

const Balance = () => {
  const [balance] = useAtom(uiBalanceAtom);

  if (balance === null || balance === undefined) return null;

  const uiBalance = balance === 0 ? 0 : balance.toFixed(3);

  return <Wrapper>{uiBalance} SOL</Wrapper>;
};

const Wrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    margin-bottom: 0.5rem;
    font-weight: bold;
    font-size: ${theme.font?.code?.size.xlarge};
    color: ${theme.colors.default.textSecondary};
  `}
`;

export default Balance;
