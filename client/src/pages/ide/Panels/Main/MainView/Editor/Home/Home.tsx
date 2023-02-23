import { FC, useEffect, useState } from "react";
import styled, { css } from "styled-components";

import Button from "../../../../../../../components/Button";
import { PROJECT_NAME } from "../../../../../../../constants";
import { ResourceProps, RESOURCES } from "./resources";
import { TutorialProps, TUTORIALS } from "./tutorials";
import { DefaultLink } from "../../../../../../../components/Link";
import { External } from "../../../../../../../components/Icons";

const Home = () => {
  // This prevents unnecessarily fetching the home content for a frame when the
  // app is first mounted
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <Wrapper>
      <ProjectTitle>{PROJECT_NAME}</ProjectTitle>
      <ContentWrapper>
        <LeftWrapper>
          <ContentTitle>Resources</ContentTitle>
          <ResourcesWrapper>
            {RESOURCES.map((r, i) => (
              <Resource key={i} {...r} />
            ))}
          </ResourcesWrapper>
        </LeftWrapper>
        <RightWrapper>
          <ContentTitle>Tutorials</ContentTitle>
          <TutorialsWrapper>
            {TUTORIALS.map((t, i) => (
              <Tutorial key={i} {...t} />
            ))}
          </TutorialsWrapper>
        </RightWrapper>
      </ContentWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
  padding: 0 8%;
`;

const ProjectTitle = styled.div`
  ${({ theme }) => css`
    text-align: center;
    font-weight: bold;
    font-size: 2rem;
    color: ${theme.colors.default.textSecondary};
    padding: 2rem;
  `}
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

const LeftWrapper = styled.div`
  max-width: 53rem;
`;

const RightWrapper = styled.div`
  min-width: 16rem;
  max-width: 27rem;
`;

const ContentTitle = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const ResourcesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const TutorialsWrapper = styled.div``;

const Resource: FC<ResourceProps> = ({
  title,
  text,
  url,
  src,
  circleImage,
}) => (
  <ResourceWrapper>
    <ResourceTitle>
      <ResourceImg src={src} circleImage={circleImage} />
      {title}
    </ResourceTitle>
    <ResourceText>{text}</ResourceText>
    <ResourceButtonWrapper>
      <DefaultLink href={url}>
        <ResourceButton kind="outline">
          Learn more <External />
        </ResourceButton>
      </DefaultLink>
    </ResourceButtonWrapper>
  </ResourceWrapper>
);

const ResourceWrapper = styled.div`
  ${({ theme }) => css`
    border: 1px solid
      ${theme.colors.default.borderColor + theme.transparency?.medium};
    border-radius: 8px;
    background-color: ${theme.colors?.home?.card?.bg};
    width: 15rem;
    height: 15rem;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    margin-right: 2rem;
    margin-bottom: 2rem;
  `}
`;

const ResourceTitle = styled.div`
  font-weight: bold;
  font-size: ${({ theme }) => theme.font?.code?.size.xlarge};
  height: 20%;
  display: flex;
  align-items: center;
`;

const ResourceImg = styled.img<{ circleImage?: boolean }>`
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  border-radius: ${({ circleImage }) => circleImage && "50%"};
`;

const ResourceText = styled.div`
  ${({ theme }) => css`
    color: ${theme.colors.default.textSecondary};
    height: 60%;
  `}
`;

const ResourceButtonWrapper = styled.div`
  width: 100%;
  height: 20%;
`;

const ResourceButton = styled(Button)`
  width: 100%;

  & > svg {
    margin-left: 0.25rem;
  }
`;

const getSrc = (url: string) => {
  let src: string = "";

  if (url.includes("youtube.com")) src = "youtube.png";
  else if (url.includes("dev.to")) src = "devto.png";

  if (src) return "/icons/platforms/" + src;
};

const Tutorial: FC<TutorialProps> = ({ title, url }) => {
  const src = getSrc(url);

  return (
    <DefaultLink href={url}>
      <TutorialWrapper>
        {src && <TutorialIcon src={src} />}
        <TutorialTitle>{title}</TutorialTitle>
      </TutorialWrapper>
    </DefaultLink>
  );
};

const TutorialWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    padding: 1rem;
    margin-bottom: 1rem;
    background-color: ${theme.colors?.home?.card?.bg};
    border: 1px solid
      ${theme.colors.default.borderColor + theme.transparency?.medium};
    border-radius: ${theme.borderRadius};
    transition: all ${theme.transition?.duration.medium}
      ${theme.transition?.type};

    &:hover {
      background-color: ${theme.colors.state.hover.bg};
    }
  `}
`;

const TutorialIcon = styled.img`
  height: 1rem;
  margin-right: 0.75rem;
`;

const TutorialTitle = styled.span``;

export default Home;
