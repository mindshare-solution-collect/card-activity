import { ASSET_LAKE, ASSET_USDT } from '../../../../constants/assets';
import { BigNumber, Contract } from 'ethers';
import {
    DEFAULT_SLIPPAGE_TOLERANCE,
    DEFAULT_TRANSACTION_DEADLINE,
    MAX_TICK,
    REFRESH_LAKE_PRICE_INTERVAL,
} from '../../../../constants/commons';
import { useContext, useEffect, useState } from 'react';

import { Button } from '../../../button/Button';
import { ButtonWithSpinner } from '../../../button/ButtonWithSpinner';
import { ClipLoader } from 'react-spinners';
import { ERC20Abi } from '../../../../abis/ERC20';
import { GradientButton } from '../../../button/gradient/GradientButton';
import { GradientButtonWithSpinner } from '../../../button/gradient/GradientButtonWithSpinner';
import { IPositionDetails } from '../../../../interfaces/positionDetails.interface';
import { JsonRpcProvider } from '@ethersproject/providers';
import { PositionsList } from '../PositionsList';
import ReactModal from 'react-modal';
import { Settings } from './Settings';
import { TokenInput } from '../TokenInput';
import { WalletConnectContext } from '../../../../context';
import cancelIcon from './../../../../assets/icons/cancel-icon.svg';
import { colors } from '../../../../constants/colors';
import { customModalStyle } from '../../../../constants/modal';
import { parseBigNumber } from '../../../../utils/parseBigNumber';
import settingsIcon from './../../../../assets/icons/settings-icon.svg';
import { useConfig } from '../../../../hooks/use-config';
import { useTokenAllowance } from '@usedapp/core';
import { useUniswap } from '../../../../hooks/use-uniswap';

type Props = {
    isOpen: boolean;
    isLoading: boolean;
    positions: IPositionDetails[];
    lakeBalance: number;
    usdtBalance: number;
    refreshPositions: () => void;
    closeModal: () => void;
};

ReactModal.setAppElement('#root');

export const ProvideLiquidityModal = ({
    isOpen,
    isLoading,
    positions,
    lakeBalance,
    usdtBalance,
    refreshPositions,
    closeModal,
}: Props) => {
    const { account, library } = useContext(WalletConnectContext);
    const { usdtAddress, lakeAddress, nonfungiblePositionManagerAddress } =
        useConfig();
    const [step, setStep] = useState(1);
    const [selectedPosition, setSelectedPosition] = useState<
        IPositionDetails | undefined
    >(undefined);
    const [slippageTolerance, setSlippageTolerance] = useState(
        DEFAULT_SLIPPAGE_TOLERANCE,
    );
    const [transactionDeadline, setTransactionDeadline] = useState(
        DEFAULT_TRANSACTION_DEADLINE,
    );
    const [tickLower, setTickLower] = useState(-MAX_TICK);
    const [tickUpper, setTickUpper] = useState(MAX_TICK);
    const [usdtInputValue, setUsdtInputValue] = useState(0);
    const [lakeInputValue, setLakeInputValue] = useState(0);
    const [isUsdtValueValid, setIsUsdtValueValid] = useState(true);
    const [isLakeValueValid, setIsLakeValueValid] = useState(true);
    const [isUsdtApproved, setIsUsdtApproved] = useState(false);
    const [isLakeApproved, setIsLakeApproved] = useState(false);
    const [isUsdtApproving, setIsUsdtApproving] = useState(false);
    const [isLakeApproving, setIsLakeApproving] = useState(false);
    const [isLiquidityProviding, setIsLiquidityProviding] = useState(false);
    const [areSettingsOpen, setAreSettingsOpen] = useState(false);
    const usdtAllowance = useTokenAllowance(
        usdtAddress,
        account,
        nonfungiblePositionManagerAddress,
    );
    const lakeAllowance = useTokenAllowance(
        lakeAddress,
        account,
        nonfungiblePositionManagerAddress,
    );
    const usdtPrice = 1;
    const [lakePrice, setLakePrice] = useState(0);

    useEffect(() => {
        const fetchData = async (library: JsonRpcProvider) => {
            const { getLakePrice } = useUniswap(library);
            setLakePrice(await getLakePrice());
        };

        if (library) {
            fetchData(library).catch(console.error);
            setInterval(() => {
                fetchData(library).catch(console.error);
            }, REFRESH_LAKE_PRICE_INTERVAL);
        }
    }, [library]);

    useEffect(() => {
        setIsUsdtApproved(
            (!!usdtAllowance &&
                parseBigNumber(usdtAllowance, ASSET_USDT.decimals) >=
                    usdtInputValue) ||
                usdtInputValue === 0,
        );
    }, [usdtInputValue]);

    useEffect(() => {
        setIsLakeApproved(
            (!!lakeAllowance &&
                parseBigNumber(lakeAllowance, ASSET_LAKE.decimals) >=
                    lakeInputValue) ||
                lakeInputValue === 0,
        );
    }, [lakeInputValue]);

    useEffect(() => {
        setSelectedPosition(undefined);
    }, [positions]);

    useEffect(() => {
        setStep(!!selectedPosition ? 2 : 1);
    }, [selectedPosition]);

    const onUsdtValueChange = (value: number) => {
        setUsdtInputValue(value);
        setIsUsdtValueValid(value <= usdtBalance);
        const lakeAmount = (value * usdtPrice) / lakePrice;
        setLakeInputValue(lakeAmount);
        setIsLakeValueValid(lakeAmount <= lakeBalance);
    };

    const onLakeValueChange = (value: number) => {
        setLakeInputValue(value);
        setIsLakeValueValid(value <= lakeBalance);
        const usdtAmount = (value * lakePrice) / usdtPrice;
        setUsdtInputValue(usdtAmount);
        setIsUsdtValueValid(usdtAmount <= usdtBalance);
    };

    const onApproveClick = async (tokenAddress: string, amount: number) => {
        tokenAddress === lakeAddress
            ? setIsLakeApproving(true)
            : setIsUsdtApproving(true);

        const tokenContract = new Contract(
            tokenAddress,
            ERC20Abi,
            library?.getSigner(account),
        );

        const resp = tokenContract.approve(
            nonfungiblePositionManagerAddress,
            BigNumber.from(amount),
        );

        await resp.wait();

        tokenAddress === lakeAddress
            ? setIsLakeApproving(false)
            : setIsUsdtApproving(false);
    };

    const onProvideLiquidityClick = async () => {
        if (library && account) {
            setIsLiquidityProviding(true);
            const { provideLiquidity } = useUniswap(library);
            await provideLiquidity(
                usdtInputValue,
                lakeInputValue,
                slippageTolerance,
                transactionDeadline,
                tickLower,
                tickUpper,
                account,
                selectedPosition,
            );
            setIsLiquidityProviding(false);
            setLakeInputValue(0);
            setUsdtInputValue(0);
            refreshPositions();
        }
    };

    const onCloseClick = () => {
        setSelectedPosition(undefined);
        setStep(1);
        setAreSettingsOpen(false);
        closeModal();
    };

    return (
        <ReactModal
            isOpen={isOpen}
            style={customModalStyle}
            contentLabel="Provide Liquidity Modal"
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            onRequestClose={onCloseClick}
        >
            <div className="flex flex-col">
                <div className="flex justify-end items-center mb-6">
                    <span className="text-sm tracking-[.1em] mr-2 text-gray-500">
                        CLOSE
                    </span>
                    <div className="w-8 h-8 flex justify-center items-center rounded-[32px] border border-gray-500 p-1">
                        <img
                            className="cursor-pointer"
                            src={cancelIcon}
                            onClick={onCloseClick}
                            alt="close"
                        ></img>
                    </div>
                </div>
                <div className="flex flex-col rounded-[32px] border border-gray-500 p-8 bg-black-800">
                    {isLoading ? (
                        <div className="flex min-w-[20vw] h-[20rem] justify-center items-center">
                            <ClipLoader
                                className="!w-[5rem] !h-[5rem]"
                                color={colors.gray['300']}
                                loading
                            />
                        </div>
                    ) : (
                        <>
                            {step === 1 ? (
                                <div className="font-kanit-medium color-gray-gradient text-shadow text-xl tracking-[.12em] text-center mb-4">
                                    CHOOSE POSITION
                                </div>
                            ) : (
                                <div className="w-full flex items-center mb-4 justify-around">
                                    <div className="font-kanit-medium color-gray-gradient text-shadow text-xl tracking-[.12em] text-center">
                                        PROVIDE LIQUIDITY
                                    </div>
                                    <img
                                        className="w-[1.5rem] h-[1.5rem] cursor-pointer"
                                        src={settingsIcon}
                                        alt="settings"
                                        onClick={() => {
                                            setAreSettingsOpen(
                                                !areSettingsOpen,
                                            );
                                        }}
                                    ></img>
                                </div>
                            )}
                            {areSettingsOpen && (
                                <Settings
                                    tickLower={tickLower}
                                    tickUpper={tickUpper}
                                    slippageTolerance={slippageTolerance}
                                    transactionDeadline={transactionDeadline}
                                    onLowerPriceChange={(event: any) => {
                                        setTickLower(
                                            event.target.value || -MAX_TICK,
                                        );
                                    }}
                                    onUpperPriceChange={(event: any) => {
                                        setTickUpper(
                                            event.target.value || MAX_TICK,
                                        );
                                    }}
                                    onSlippageToleranceChange={(event: any) => {
                                        setSlippageTolerance(
                                            event.target.value ||
                                                DEFAULT_SLIPPAGE_TOLERANCE,
                                        );
                                    }}
                                    onTransactionDeadlineChange={(
                                        event: any,
                                    ) => {
                                        setTransactionDeadline(
                                            event.target.value ||
                                                DEFAULT_TRANSACTION_DEADLINE,
                                        );
                                    }}
                                    onFullRangeClick={() => {
                                        setTickLower(-MAX_TICK);
                                        setTickUpper(MAX_TICK);
                                    }}
                                />
                            )}
                            <div className="flex min-w-[20vw]">
                                {step === 1 ? (
                                    <PositionsList
                                        positions={positions}
                                        onClick={(position) =>
                                            setSelectedPosition(position)
                                        }
                                    />
                                ) : (
                                    <>
                                        <div className="w-full flex flex-col">
                                            <TokenInput
                                                tokenSymbol="USDT"
                                                tokenPrice={usdtPrice}
                                                inputValue={usdtInputValue}
                                                isValueValid={isUsdtValueValid}
                                                setMaxInputValue={() =>
                                                    onUsdtValueChange(
                                                        usdtBalance,
                                                    )
                                                }
                                                onChange={(event: any) =>
                                                    onUsdtValueChange(
                                                        event.target.value ||
                                                            '',
                                                    )
                                                }
                                            />
                                            <TokenInput
                                                tokenSymbol="LAKE"
                                                tokenPrice={lakePrice}
                                                inputValue={lakeInputValue}
                                                isValueValid={isLakeValueValid}
                                                setMaxInputValue={() =>
                                                    onLakeValueChange(
                                                        lakeBalance,
                                                    )
                                                }
                                                onChange={(event: any) =>
                                                    onLakeValueChange(
                                                        event.target.value ||
                                                            '',
                                                    )
                                                }
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-col items-center">
                                {step === 1 ? (
                                    <div className="mt-8">
                                        <Button
                                            size="medium"
                                            disabled={false}
                                            text="NEW POSITION"
                                            onClick={() => setStep(2)}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        {!isUsdtApproved && (
                                            <div className="mt-8">
                                                {isUsdtApproving ? (
                                                    <GradientButtonWithSpinner
                                                        size="medium"
                                                        disabled={true}
                                                    />
                                                ) : (
                                                    <GradientButton
                                                        size="medium"
                                                        disabled={false}
                                                        text="APPROVE USDT"
                                                        onClick={() =>
                                                            onApproveClick(
                                                                usdtAddress,
                                                                usdtInputValue,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {!isLakeApproved && (
                                            <div className="mt-8">
                                                {isLakeApproving ? (
                                                    <GradientButtonWithSpinner
                                                        size="medium"
                                                        disabled={true}
                                                    />
                                                ) : (
                                                    <GradientButton
                                                        size="medium"
                                                        disabled={false}
                                                        text="APPROVE LAKE"
                                                        onClick={() =>
                                                            onApproveClick(
                                                                lakeAddress,
                                                                lakeInputValue,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {isLakeApproved && isUsdtApproved && (
                                            <div className="mt-8">
                                                {isLiquidityProviding ? (
                                                    <ButtonWithSpinner
                                                        size="medium"
                                                        disabled={true}
                                                    />
                                                ) : (
                                                    <Button
                                                        size="medium"
                                                        disabled={
                                                            lakeInputValue ===
                                                                0 ||
                                                            usdtInputValue ===
                                                                0 ||
                                                            !isLakeValueValid ||
                                                            !isUsdtValueValid
                                                        }
                                                        text="PROVIDE LIQUIDITY"
                                                        onClick={
                                                            onProvideLiquidityClick
                                                        }
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ReactModal>
    );
};
