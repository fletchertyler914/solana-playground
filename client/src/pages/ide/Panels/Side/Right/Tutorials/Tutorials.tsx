import { FC, useEffect, useState } from "react";
import styled, { css, keyframes } from "styled-components";

import Text from "../../../../../../components/Text";
import {
  PgTutorial,
  TutorialData,
  TutorialMetadata,
} from "../../../../../../utils/pg";

type TutorialFullData = (TutorialData & TutorialMetadata)[];
type TutorialsData = { completed: TutorialFullData; ongoing: TutorialFullData };

const Tutorials = () => {
  const [tutorialsData, setTutorialsData] = useState<TutorialsData>();

  useEffect(() => {
    (async () => {
      const tutorialNames = await PgTutorial.getUserTutorialNames();
      const data: TutorialsData = { completed: [], ongoing: [] };
      for (const tutorialName of tutorialNames) {
        const tutorialData = PgTutorial.getTutorialData(tutorialName);
        if (!tutorialData) continue;
        const tutorialMetadata = await PgTutorial.getMetadata(tutorialName);
        if (tutorialMetadata.completed) {
          data.completed.push({ ...tutorialData, ...tutorialMetadata });
        } else {
          data.ongoing.push({ ...tutorialData, ...tutorialMetadata });
        }
      }

      setTutorialsData(data);
    })();
  }, []);

  if (!tutorialsData) return null;

  return (
    <Wrapper>
      {!tutorialsData.ongoing.length && !tutorialsData.completed.length && (
        <Text>Choose and start a new tutorial to track your progress.</Text>
      )}
      <TutorialGroup name="Ongoing" data={tutorialsData.ongoing} />
      <TutorialGroup name="Completed" data={tutorialsData.completed} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  ${({ theme }) => css`
    padding: 1.5rem 1rem;
    color: ${theme.colors.default.textSecondary};
  `}
`;

const TutorialsSectionHeader = styled.div`
  &:not(:first-child) {
    margin-top: 2rem;
  }
`;

interface TutorialGroupProps {
  name: string;
  data: TutorialFullData;
}

const TutorialGroup: FC<TutorialGroupProps> = ({ name, data }) => (
  <>
    {data.length > 0 && (
      <TutorialsSectionHeader>
        {name} -&gt; <Bold>{data.length}</Bold>
      </TutorialsSectionHeader>
    )}
    {data.map((t, i) => (
      <TutorialWrapper
        key={i}
        onClick={() => PgTutorial.open(t.name)}
        progress={t.completed ? 100 : ((t.pageNumber - 1) / t.pageCount) * 100}
      >
        <TutorialName>{t.name}</TutorialName>
      </TutorialWrapper>
    ))}
  </>
);

const Bold = styled.span`
  font-weight: bold;
`;

const TutorialWrapper = styled.div<{ progress: number }>`
  ${({ theme, progress }) => css`
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background-color: ${theme.colors.right?.otherBg};
    border-radius: ${theme.borderRadius};
    box-shadow: ${theme.boxShadow};
    transition: background-color ${theme.transition?.duration.medium}
      ${theme.transition?.type};
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      height: 0.125rem;
      background: ${progress === 100
        ? `linear-gradient(90deg, ${theme.colors.state.success.color} 0%, ${
            theme.colors.state.success.color + theme.transparency?.high
          } 100%)`
        : `linear-gradient(90deg, ${theme.colors.default.primary} 0%, ${theme.colors.default.secondary} 100%)`};
      animation: ${animateWidth(progress)} ${theme.transition?.duration.long}
        ${theme.transition?.type} forwards;
    }

    &:hover {
      background-color: ${theme.colors.state.hover.bg};
      cursor: pointer;
    }
  `}
`;

const animateWidth = (progress: number) =>
  keyframes`
    from {
      width: 0;
    }
    to {
      width: ${progress}%;
    }
`;

const TutorialName = styled.div`
  font-weight: bold;
`;

export default Tutorials;
