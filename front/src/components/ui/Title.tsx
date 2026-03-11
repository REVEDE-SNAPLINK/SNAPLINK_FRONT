import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";
import styled from "@/utils/scale/CustomStyled";

interface TitleProps {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
}

function Title({ children, style }: TitleProps) {
    return (
        <TitleContainer style={style}>
            <Bubble>
                {children}
            </Bubble>
            <Tail />
        </TitleContainer>
    );
}

const TitleContainer = styled.View`
    align-items: flex-start;
`;

const Bubble = styled.View`
    background-color: #3C3C3C;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    padding: 10px 16px;
    min-height: 38px;
`;

const Tail = styled.View`
    width: 0;
    height: 0;
    border-style: solid;
    border-left-width: 6px;
    border-right-width: 6px;
    border-top-width: 10px;
    background-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;
    border-top-color: #3C3C3C;
    margin-left: 29px;
`;

export default Title;