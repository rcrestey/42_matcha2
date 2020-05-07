import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';

const container = styled.section`
    ${tw`overflow-y-auto`}

    ${({ maxHeight }) =>
        css`
            max-height: ${maxHeight}px;
        `}
`;

export default container;
