import { useContext, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button } from '../button/Button';
import { ButtonWithIcon } from '../button/ButtonWithIcon';
import copyIcon from './../../assets/icons/copy-icon.svg';
import keyIcon from './../../assets/icons/key-icon.svg';
import horizontalLogo from './../../assets/icons/horizontal-logo.png';
import { formatAddress } from '../../utils/formatAddress';
import { WalletConnectContext } from '../../context';
import { GradientButtonWithIcon } from '../button/gradient/GradientButtonWithIcon';
import { ASSET_ETH, ASSET_LAKE } from '../../constants/assets';
import { formatValue } from '../../utils/formatValue';

export const Navigation = () => {
    const {
        active,
        account,
        ethBalance,
        tokenBalance,
        error,
        activateBrowserWallet,
    } = useContext(WalletConnectContext);

    useEffect(() => {
        if (active && !error) {
            activateBrowserWallet();
        }
    }, []);

    const activate = async () => {
        await activateBrowserWallet();
    };

    return (
        <nav className="relative flex flex-wrap items-center justify-between px-8 py-2 bg-black-500">
            <div className="w-full flex flex-wrap items-center justify-between">
                <div>
                    <img
                        className="w-[24rem] pl-8"
                        src={horizontalLogo}
                        alt="logo"
                    ></img>
                </div>

                <div className="flex items-center justify-end">
                    {account ? (
                        <>
                            <Button
                                disabled={true}
                                text={`${formatValue(
                                    tokenBalance,
                                    ASSET_LAKE.symbol,
                                    2,
                                )} | ${formatValue(
                                    ethBalance,
                                    ASSET_ETH.symbol,
                                    4,
                                )}`}
                            ></Button>

                            <div className="ml-6">
                                <ButtonWithIcon
                                    disabled={true}
                                    text={formatAddress(account)}
                                >
                                    <CopyToClipboard text={account}>
                                        <img
                                            className="cursor-pointer"
                                            src={copyIcon}
                                            alt="copy"
                                        ></img>
                                    </CopyToClipboard>
                                </ButtonWithIcon>
                            </div>
                        </>
                    ) : (
                        <GradientButtonWithIcon
                            disabled={false}
                            text="CONNECT WALLET"
                            onClick={activate}
                        >
                            <img src={keyIcon} alt="copy"></img>
                        </GradientButtonWithIcon>
                    )}
                </div>
            </div>
        </nav>
    );
};
