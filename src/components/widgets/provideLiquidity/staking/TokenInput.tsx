import { colors } from '../../../../constants/colors';
import styled from 'styled-components';

type Props = {
    inputValue: number;
    setMaxInputValue: () => void;
    onChange: (event: any) => void;
};

export const TokenInput = ({
    inputValue,
    setMaxInputValue,
    onChange,
}: Props) => {
    const onMaxClick = () => {
        setMaxInputValue();
    };
    return (
        <InputContainer className="w-full h-[7rem] flex justify-between pl-8 pr-2 pt-2 my-4">
            <div className="w-full flex flex-col items-end">
                <button
                    className="border border-gray-500 rounded-[32px] px-2 "
                    onClick={onMaxClick}
                >
                    <span>MAX</span>
                </button>
                <div className="flex flex-col items-center mt-2 mr-4">
                    <div className="flex items-center">
                        <input
                            className="font-kanit-medium color-gradient text-2xl font-bold truncate text-end w-[10rem] mr-2"
                            value={inputValue}
                            onChange={onChange}
                        />
                        <span className="font-kanit-medium color-gradient text-2xl font-bold">
                            LP TOKENS
                        </span>
                    </div>
                </div>
            </div>
        </InputContainer>
    );
};

const InputContainer = styled.div`
    box-shadow: inset 1px 1px 1px rgba(68, 68, 68, 0.05),
        inset -1px -1px 4px rgba(134, 134, 134, 0.12);
    border-radius: 20px;
    background: ${colors.black[600]};
`;
