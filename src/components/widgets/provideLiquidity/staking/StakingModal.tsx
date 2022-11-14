import { useContext, useEffect, useState } from 'react';

import { ASSET_LP_TOKEN } from '../../../../constants/assets';
import { Button } from '../../../button/Button';
import { ButtonWithSpinner } from '../../../button/ButtonWithSpinner';
import ReactModal from 'react-modal';
import { TokenInput } from './TokenInput';
import { WalletConnectContext } from '../../../../context';
import cancelIcon from '../../../../assets/icons/cancel-icon.svg';
import { parseBigNumber } from '../../../../utils/parseBigNumber';
import { useConfig } from '../../../../hooks/use-config';
import { useTokenBalance } from '@usedapp/core';

type Props = {
    isOpen: boolean;
    refreshStakingData: () => void;
    closeModal: () => void;
};

const customStyles = {
    overlay: {
        background: 'rgba(0, 0, 0, 0.8)',
    },
    content: {
        background: 'transparent',
        border: 'none',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

ReactModal.setAppElement('#root');

export const StakingModal = ({
    isOpen,
    refreshStakingData,
    closeModal,
}: Props) => {
    const { account, library } = useContext(WalletConnectContext);
    const { lpTokenAddress, stakingAddress } = useConfig();
    const [lpTokenBalance, setLPTokenBalance] = useState(0);
    const [lpTokenInputValue, setLPTokenInputValue] = useState(0);
    const [isLPTokenValueValid, setIsLPTokenValueValid] = useState(true);
    const [isStaking, setIsStaking] = useState(false);
    const lpTokenBalanceAsBigNumber = useTokenBalance(lpTokenAddress, account);

    useEffect(() => {
        setLPTokenBalance(
            lpTokenBalanceAsBigNumber
                ? parseBigNumber(
                      lpTokenBalanceAsBigNumber,
                      ASSET_LP_TOKEN.decimals,
                  )
                : 0,
        );
    }, [lpTokenBalanceAsBigNumber]);

    const onLPTokenValueChange = (value: number) => {
        setLPTokenInputValue(value);
        setIsLPTokenValueValid(value <= lpTokenBalance);
    };

    const onStakeClick = async () => {
        if (library && account) {
            setIsStaking(true);
            // Stake
            setIsStaking(false);
            setLPTokenInputValue(0);
            refreshStakingData();
        }
    };

    return (
        <ReactModal
            isOpen={isOpen}
            style={customStyles}
            contentLabel="Staking Modal"
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
                            onClick={closeModal}
                            alt="copy"
                        ></img>
                    </div>
                </div>
                <div className="flex flex-col rounded-[32px] border border-gray-500 p-8 bg-black-800">
                    <div className="font-kanit-medium color-gray-gradient text-shadow text-xl tracking-[.12em] text-center mb-4">
                        STAKE
                    </div>
                    <div className="flex flex-col min-w-[20vw]">
                        <TokenInput
                            inputValue={lpTokenInputValue}
                            setMaxInputValue={() =>
                                onLPTokenValueChange(lpTokenBalance)
                            }
                            onChange={(event: any) =>
                                onLPTokenValueChange(event.target.value || '')
                            }
                        />
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="mt-8">
                            {isStaking ? (
                                <ButtonWithSpinner
                                    size="medium"
                                    disabled={true}
                                />
                            ) : (
                                <Button
                                    size="medium"
                                    disabled={
                                        lpTokenInputValue === 0 ||
                                        !isLPTokenValueValid
                                    }
                                    text="STAKE"
                                    onClick={onStakeClick}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ReactModal>
    );
};
