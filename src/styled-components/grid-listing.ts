import styled from "styled-components";

const GridListing = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 640px) {
    grid-gap: ${({ theme }) => theme.global?.spacing};
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
  @media (min-width: 1366px) {
    grid-template-columns: repeat(5, 1fr);
  }
  @media (min-width: 1900px) {
    grid-template-columns: repeat(6, 1fr);
  }
`;

export default GridListing;
