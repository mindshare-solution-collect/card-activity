import { GradientBorderWithNoShadow } from '../../../GradientBorder';
import { colors } from '../../../../constants/colors';
import styled from 'styled-components';

type Props = {
    tickLower: number;
    tickUpper: number;
    slippageTolerance: number;
    transactionDeadline: number;
    onLowerPriceChange: (event: any) => void;
    onUpperPriceChange: (event: any) => void;
    onSlippageToleranceChange: (event: any) => void;
    onTransactionDeadlineChange: (event: any) => void;
    onFullRangeClick: () => void;
};

export const Settings = ({
    tickLower,
    tickUpper,
    slippageTolerance,
    transactionDeadline,
    onLowerPriceChange,
    onUpperPriceChange,
    onSlippageToleranceChange,
    onTransactionDeadlineChange,
    onFullRangeClick,
}: Props) => {
    return (
        <SettingsContainer className="w-full flex flex-col p-4 my-4 font-kanit-medium whitespace-nowrap text-xs">
            <div className="flex w-full justify-between">
                <div className="tracking-[.12em] flex items-center">
                    TICK LOWER:
                </div>
                <div className="flex w-[10rem]">
                    <input
                        className="color-gradient text-base font-bold truncate text-end w-full"
                        value={tickLower}
                        onChange={onLowerPriceChange}
                    />
                    <div className="tracking-[.12em] ml-2 flex items-center">
                        LAKE / USDT
                    </div>
                </div>
            </div>
            <div className="flex w-full justify-between">
                <div className="tracking-[.12em] flex items-center">
                    TICK UPPER:
                </div>
                <div className="flex w-[10rem]">
                    <input
                        className="color-gradient text-base font-bold truncate text-end w-full"
                        value={tickUpper}
                        onChange={onUpperPriceChange}
                    />
                    <div className="tracking-[.12em] ml-2 flex items-center">
                        LAKE / USDT
                    </div>
                </div>
            </div>
            <div className="flex w-full justify-center my-2">
                <button onClick={onFullRangeClick}>
                    <GradientBorderWithNoShadow className="w-[6rem] h-[1.5rem] p-px flex justify-center items-center rounded-[32px]">
                        <div className="w-full h-full flex justify-center items-center rounded-[32px] bg-black-500 px-2">
                            FULL RANGE
                        </div>
                    </GradientBorderWithNoShadow>
                </button>
            </div>
            <div className="flex w-full justify-between">
                <div className="tracking-[.12em] flex items-center">
                    SLIPPAGE TOLERANCE:
                </div>
                <div className="flex w-[5rem]">
                    <input
                        className="color-gradient text-base font-bold truncate text-end w-full"
                        value={slippageTolerance}
                        onChange={onSlippageToleranceChange}
                    />
                    <div className="tracking-[.12em] ml-2 flex items-center">
                        %
                    </div>
                </div>
            </div>
            <div className="flex w-full justify-between">
                <div className="tracking-[.12em] flex items-center">
                    TRANSACTION DEADLINE:
                </div>
                <div className="flex w-[5rem]">
                    <input
                        className="color-gradient text-base font-bold truncate text-end w-full"
                        value={transactionDeadline}
                        onChange={onTransactionDeadlineChange}
                    />
                    <div className="tracking-[.12em] ml-2 flex items-center">
                        MIN
                    </div>
                </div>
            </div>
        </SettingsContainer>
    );
};

const SettingsContainer = styled.div`
    box-shadow: inset 1px 1px 1px rgba(68, 68, 68, 0.05),
        inset -1px -1px 4px rgba(134, 134, 134, 0.12);
    border-radius: 20px;
    background: ${colors.black[600]};
`;
