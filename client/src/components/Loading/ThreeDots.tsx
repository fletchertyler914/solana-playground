import styled, { css, keyframes } from "styled-components";

interface ThreeDotsProps {
  width?: string;
  height?: string;
  distance?: string;
}

export const ThreeDots = styled.div<ThreeDotsProps>`
  ${({ theme, width = "0.5rem", height = "0.5rem", distance = "1rem" }) => css`
    --bg: ${theme.colors.default.primary};
    --bg-fade: ${theme.colors.default.primary + theme.transparency?.low};
    --distance: ${distance};

    position: relative;
    animation: ${animation} 1s infinite linear alternate;
    animation-delay: 0.5s;

    &,
    &::before,
    &::after {
      width: ${width};
      height: ${height};
      border-radius: ${theme.borderRadius};
      background-color: var(--bg);
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 0;
      display: inline-block;
      animation: ${animation} 1s infinite alternate;
    }

    &::before {
      left: calc(var(--distance) * -1);
      animation-delay: 0s;
    }

    &::after {
      left: var(--distance);
      animation-delay: 1s;
    }
  `}
`;

const animation = keyframes`
  0% {
    background-color: var(--bg);
  }
  100% {
    background-color: var(--bg-fade);
  }
`;
