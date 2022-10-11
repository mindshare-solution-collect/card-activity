import {
    Mainnet,
    Goerli,
    useEthers,
    useEtherBalance,
    useTokenBalance,
} from '@usedapp/core';
import { JsonRpcProvider } from '@ethersproject/providers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useEffect, useState } from 'react';
import { ASSET_LAKE } from '../constants/assets';
import { parseBigNumber } from '../utils/parseBigNumber';

type InternalState = {
    loading: boolean;
    error?: string | null;
};

const initialState = {
    loading: false,
    error: null,
};

export type WalletConnectState = {
    loading: boolean;
    active: boolean;
    account: string | undefined;
    ethBalance: number;
    tokenBalance: number;
    library: JsonRpcProvider | undefined;
    error: string | null;
    activateProvider: () => void;
    deactivate: () => void;
    activateBrowserWallet: () => void;
};

export const useWalletConnect = () => {
    const [internalState, setInternalState] =
        useState<InternalState>(initialState);

    const {
        isLoading,
        active,
        account,
        library,
        error,
        activate,
        deactivate,
        activateBrowserWallet,
    } = useEthers();

    useEffect(() => {
        if (!active && !error) {
            activateProvider();
        }
    }, []);

    const ethBalanceAsBigNumber = useEtherBalance(account);
    const tokenBalanceAsBigNumber = useTokenBalance(
        ASSET_LAKE.address,
        account,
    );

    const getWeb3Modal = () => {
        const providerOptions = {
            injected: {
                display: {
                    name: 'Metamask',
                    description: 'Connect with the provider in your Browser',
                },
                package: null,
            },
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    [Mainnet.chainId]: `https://eth-mainnet.g.alchemy.com/v2/${
                        import.meta.env.VITE_ALCHEMY_ETHEREUM_KEY
                    }`,
                    [Goerli.chainId]: `https://eth-goerli.g.alchemy.com/v2/${
                        import.meta.env.VITE_ALCHEMY_GOERLI_KEY
                    }`,
                },
            },
        };
        const web3Modal = new Web3Modal({
            network: 'mainnet',
            cacheProvider: true,
            disableInjectedProvider: false,
            providerOptions,
        });

        return web3Modal;
    };

    const activateProvider = async () => {
        setInternalState({
            ...internalState,
            loading: true,
        });

        const web3Modal = getWeb3Modal();

        try {
            const provider = await web3Modal.connect();
            await activate(provider);
            setInternalState({
                ...internalState,
                error: null,
                loading: false,
            });
        } catch (error: any) {
            setInternalState({
                ...internalState,
                error: error,
                loading: false,
            });
        }
    };

    const handleDeactivate = () => {
        deactivate();
        getWeb3Modal().clearCachedProvider();
    };

    return {
        loading: internalState.loading || isLoading,
        active,
        account,
        ethBalance: ethBalanceAsBigNumber
            ? parseBigNumber(ethBalanceAsBigNumber)
            : 0,
        tokenBalance: tokenBalanceAsBigNumber
            ? parseBigNumber(tokenBalanceAsBigNumber)
            : 0,
        library,
        error: internalState.error || error?.toString() || null,
        activateProvider,
        deactivate: handleDeactivate,
        activateBrowserWallet,
    };
};
