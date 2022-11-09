import { ASSET_LAKE, ASSET_LP_TOKEN } from '../../constants/assets';
import { useContext, useEffect, useState } from 'react';

import { AccountMetric } from './AccountMetric';
import { GradientButtonWithIcon } from '../button/gradient/GradientButtonWithIcon';
import { IBeneficiaryOverview } from '../../interfaces/beneficiaryOverview.interface';
import { IVestingSchedule } from '../../interfaces/vestingSchedule.interface';
import { JsonRpcProvider } from '@ethersproject/providers';
import { REFRESH_LAKE_PRICE_INTERVAL } from '../../constants/commons';
import { WalletConnectContext } from '../../context';
import checkedIcon from '../../assets/icons/checked-icon.svg';
import { colors } from '../../constants/colors';
import dropIcon from '../../assets/icons/drop-icon.svg';
import { formatVestingScheduleData } from '../../utils/formatVestingScheduleData';
import keyIcon from '../../assets/icons/key-icon.svg';
import lockClosedIcon from '../../assets/icons/lock-closed-icon.svg';
import lockOpenIcon from '../../assets/icons/lock-open-icon.svg';
import { parseBigNumber } from '../../utils/parseBigNumber';
import styled from 'styled-components';
import uncheckedIcon from '../../assets/icons/unchecked-icon.svg';
import { useBeneficiaryOverview } from '../../hooks/use-beneficiary-overview';
import { useConfig } from '../../hooks/use-config';
import { useTgeTimestamp } from '../../hooks/use-tge-timestamp';
import { useTokenBalance } from '@usedapp/core';
import { useUniswap } from '../../hooks/use-uniswap';

export const AccountOverview = () => {
    const { account, library, activateProvider } =
        useContext(WalletConnectContext);
    const { lakeAddress, lpTokenAddress } = useConfig();
    const [isVerified, setIsVerified] = useState(false);
    const [lakeBalance, setLakeBalance] = useState(0);
    const [lpTokenBalance, setLpTokenBalance] = useState(0);
    const [lakePrice, setLakePrice] = useState(0);
    const [totalLocked, setTotalLocked] = useState(0);
    const [totalUnlocked, setTotalUnlocked] = useState(0);
    const [vestingSchedules, setVestingSchedules] = useState<
        IVestingSchedule[]
    >([]);
    const { getBeneficiaryOverview } = useBeneficiaryOverview();
    const { getTgeTimestamp } = useTgeTimestamp();
    const lakeBalanceAsBigNumber = useTokenBalance(lakeAddress, account);
    const lpTokenBalanceAsBigNumber = useTokenBalance(lpTokenAddress, account);

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
        setBalances();
    }, [lakeBalanceAsBigNumber, lpTokenBalanceAsBigNumber]);

    useEffect(() => {
        const fetchData = async (library: JsonRpcProvider, account: string) => {
            const beneficiaryOverview = await getBeneficiaryOverview(
                library,
                account,
            );
            const tgeTimestamp = await getTgeTimestamp(library);

            const vestingSchedules = beneficiaryOverview.map(
                (el: IBeneficiaryOverview) =>
                    formatVestingScheduleData(el, tgeTimestamp),
            );

            setVestingSchedules(vestingSchedules);
        };

        if (library && account) {
            fetchData(library, account).catch(console.error);
        }
    }, [library, account]);

    useEffect(() => {
        let locked = 0;
        let unlocked = 0;
        vestingSchedules.map((el) => {
            locked = locked + el.allocatedAmount - el.unlockedAmount;
            unlocked = unlocked + el.unlockedAmount - el.withdrawnAmount;
        });
        setTotalLocked(locked);
        setTotalUnlocked(unlocked);
    }, [vestingSchedules]);

    const setBalances = () => {
        setLakeBalance(
            lakeBalanceAsBigNumber
                ? parseBigNumber(lakeBalanceAsBigNumber, ASSET_LAKE.decimals)
                : 0,
        );
        setLpTokenBalance(
            lpTokenBalanceAsBigNumber
                ? parseBigNumber(
                      lpTokenBalanceAsBigNumber,
                      ASSET_LP_TOKEN.decimals,
                  )
                : 0,
        );
    };

    const activate = async () => {
        await activateProvider();
    };

    return (
        <div className="w-full h-full bg-black-800 rounded-[30px] inset-shadow relative">
            <div
                className={`w-full h-full flex flex-col items-center px-16 ${
                    account ? '' : 'blur-sm'
                }`}
            >
                <div className="w-full font-kanit-medium color-gray-gradient text-shadow text-3xl tracking-[.12em] my-8">
                    YOUR ACCOUNT
                </div>
                <StatContainer>
                    <div className="w-1/2 mx-2 flex items-center justify-center">
                        PIE CHART
                    </div>
                    <div className="w-1/2 h-full flex flex-col mx-4 py-4 justify-between">
                        <AccountMetric
                            title={'LOCKED $LAKE'}
                            icon={
                                <img
                                    className="w-[3.5rem] h-[3.5rem]"
                                    src={lockClosedIcon}
                                    alt="icon"
                                ></img>
                            }
                            value={totalLocked}
                            usdValue={totalLocked * lakePrice}
                        />
                        <AccountMetric
                            title={'UNLOCKED $LAKE'}
                            icon={
                                <img
                                    className="w-[3.5rem] h-[3.5rem]"
                                    src={lockOpenIcon}
                                    alt="icon"
                                ></img>
                            }
                            value={totalUnlocked}
                            usdValue={totalUnlocked * lakePrice}
                        />
                        <AccountMetric
                            title={'TOTAL $LAKE'}
                            icon={
                                <img
                                    className="w-[3.5rem] h-[3.5rem]"
                                    src={lockOpenIcon}
                                    alt="icon"
                                ></img>
                            }
                            value={lakeBalance}
                            usdValue={lakeBalance * lakePrice}
                        />
                        <AccountMetric
                            title={'LP TOKENS AVAILABLE'}
                            icon={
                                <img
                                    className="w-[3.5rem] h-[3.5rem]"
                                    src={dropIcon}
                                    alt="icon"
                                ></img>
                            }
                            value={lpTokenBalance}
                        />
                    </div>
                </StatContainer>
                <div className="w-full flex justify-end">
                    <div className="flex items-center mr-8">
                        <img
                            className="w-[3rem] h-[3rem] mr-2"
                            src={account ? checkedIcon : uncheckedIcon}
                            alt="icon"
                        ></img>
                        <span className="color-gradient-light tracking-wider text-sm font-medium font-kanit-medium">
                            WALLET {account ? 'CONNECTED' : 'DISCONNECTED'}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <img
                            className="w-[3rem] h-[3rem] mr-2"
                            src={isVerified ? checkedIcon : uncheckedIcon}
                            alt="icon"
                        ></img>
                        <span className="color-gradient-light tracking-wider text-sm font-medium font-kanit-medium">
                            IDENTITY {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                    </div>
                </div>
            </div>
            {!account && (
                <div className="absolute top-[50%] left-[37%]">
                    <GradientButtonWithIcon
                        size="medium"
                        disabled={false}
                        text="CONNECT WALLET"
                        onClick={activate}
                    >
                        <img src={keyIcon} alt="key"></img>
                    </GradientButtonWithIcon>
                </div>
            )}
        </div>
    );
};

const StatContainer = styled.div`
    box-shadow: inset 1px 1px 1px rgba(68, 68, 68, 0.05),
        inset -1px -1px 4px rgba(134, 134, 134, 0.12);
    border-radius: 20px;
    background: ${colors.black[600]};
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;
