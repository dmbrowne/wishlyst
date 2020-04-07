import styled from "styled-components";

const GridListing = styled.div`
  display: grid;
  grid-gap: ${({ theme }) => theme.global?.spacing};

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 1366px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (min-width: 1920) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

export default GridListing;
