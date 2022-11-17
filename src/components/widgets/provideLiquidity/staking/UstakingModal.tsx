import { useContext, useEffect, useState } from 'react';

import { Button } from '../../../button/Button';
import { ButtonWithSpinner } from '../../../button/ButtonWithSpinner';
import { ClipLoader } from 'react-spinners';
import { IPositionDetails } from '../../../../interfaces/positionDetails.interface';
import { Position } from '../Position';
import { PositionsList } from '../PositionsList';
import ReactModal from 'react-modal';
import { WalletConnectContext } from '../../../../context';
import cancelIcon from '../../../../assets/icons/cancel-icon.svg';
import { colors } from '../../../../constants/colors';
import { customModalStyle } from '../../../../constants/modal';
import { useUnstakePosition } from '../../../../hooks/use-unstake-position';

type Props = {
    isOpen: boolean;
    isLoading: boolean;
    stakedPositions: IPositionDetails[];
    refreshPositions: () => void;
    refreshStakedPositions: () => void;
    closeModal: () => void;
};

ReactModal.setAppElement('#root');

export const UnstakingModal = ({
    isOpen,
    isLoading,
    stakedPositions,
    refreshPositions,
    refreshStakedPositions,
    closeModal,
}: Props) => {
    const { account, library } = useContext(WalletConnectContext);
    const [step, setStep] = useState(1);
    const [selectedPosition, setSelectedPosition] = useState<
        IPositionDetails | undefined
    >(undefined);
    const [isUnstaking, setIsUnstaking] = useState(false);

    useEffect(() => {
        setStep(!!selectedPosition ? 2 : 1);
    }, [selectedPosition]);

    useEffect(() => {
        setSelectedPosition(undefined);
    }, [stakedPositions]);

    const onUnstakeClick = async () => {
        if (library && account) {
            setIsUnstaking(true);
            await useUnstakePosition(
                library,
                account,
                selectedPosition!.positionId,
            );
            setIsUnstaking(false);
            refreshPositions();
            refreshStakedPositions();
            setStep(1);
        }
    };

    const onCloseClick = () => {
        setSelectedPosition(undefined);
        setStep(1);
        closeModal();
    };

    return (
        <ReactModal
            isOpen={isOpen}
            style={customModalStyle}
            contentLabel="Staking Modal"
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
                            alt="copy"
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
                            <div className="font-kanit-medium color-gray-gradient text-shadow text-xl tracking-[.12em] text-center mb-4">
                                {step === 1 ? 'CHOOSE POSITION' : 'UNSTAKE'}
                            </div>
                            <div className="flex flex-col min-w-[20vw]">
                                {step === 1 || !selectedPosition ? (
                                    <PositionsList
                                        positions={stakedPositions}
                                        onClick={(position) =>
                                            setSelectedPosition(position)
                                        }
                                    />
                                ) : (
                                    <div className="mt-8">
                                        <Position
                                            position={selectedPosition}
                                            disabled={true}
                                        />
                                    </div>
                                )}
                            </div>
                            {step === 2 && (
                                <div className="flex flex-col items-center">
                                    <div className="mt-8">
                                        {isUnstaking ? (
                                            <ButtonWithSpinner
                                                size="medium"
                                                disabled={true}
                                            />
                                        ) : (
                                            <Button
                                                size="medium"
                                                disabled={false}
                                                text="UNSTAKE"
                                                onClick={onUnstakeClick}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </ReactModal>
    );
};
