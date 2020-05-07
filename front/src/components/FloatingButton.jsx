import styled from 'styled-components';
import tw from 'tailwind.macro';

const MarginBottomMobileStyles = tw`mb-20`;

const Button = styled.button`
    ${tw`flex justify-center items-center fixed right-0 bottom-0 m-6 h-12 w-12 shadow-lg rounded-full bg-blue-800 text-white`}

    transition: color 150ms, background-color 150ms;

    &:hover,
    &:focus {
        ${tw`outline-none`}
    }

    &:disabled {
        ${tw`bg-gray-300 text-gray-700`}
    }

    @media (max-width: 768px) {
        ${({ marginBottomMobile }) =>
            marginBottomMobile && MarginBottomMobileStyles}
    }
`;

export default Button;
