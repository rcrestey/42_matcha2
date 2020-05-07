import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';

const Container = styled.div`
    ${tw`py-3 my-1`}
`;

const Title = styled.p`
    ${tw`mb-4 mx-2`}
`;

const RangeAsideContainer = styled.div`
    ${tw`flex items-center mx-4`}
`;

export function trunc(number) {
    const truncated = Math.trunc(number);

    if (number === truncated) return number;
    return truncated + 1;
}

export default function Range({
    label,
    range,
    setRange,
    max = 100,
    formatValue = value => value,
}) {
    return (
        <Container>
            <Title>{label}</Title>
            <RangeAsideContainer>
                <InputRange
                    maxValue={trunc(max)}
                    minValue={0}
                    value={{ min: range[0], max: range[1] }}
                    onChange={({ min, max }) => setRange([min, max])}
                    formatLabel={formatValue}
                    allowSameValues
                />
            </RangeAsideContainer>
        </Container>
    );
}
