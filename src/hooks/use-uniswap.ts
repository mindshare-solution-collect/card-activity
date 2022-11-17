import { ASSET_LAKE, ASSET_USDT } from '../constants/assets';
import { CurrencyAmount, Percent } from '@uniswap/sdk-core';
import { NonfungiblePositionManager, Position } from '@uniswap/v3-sdk';

import { DEFAULT_TRANSACTION_DEADLINE } from '../constants/commons';
import { IPositionDetails } from '../interfaces/positionDetails.interface';
import { JsonRpcProvider } from '@ethersproject/providers';
import { useConfig } from './use-config';
import { useLakeToken } from './use-lake-token';
import { useUniswapPool } from './use-uniswap-pool';
import { useUsdtToken } from './use-usdt-token';

export const useUniswap = (provider: JsonRpcProvider) => {
    const { nonfungiblePositionManagerAddress } = useConfig();

    const getLakePrice = async (): Promise<number> => {
        const pool = await useUniswapPool(provider);
        return Number(pool.token1Price.toSignificant());
    };

    const provideLiquidity = async (
        usdtAmount: number,
        lakeAmount: number,
        slippageTolerance: number,
        transactionDeadline: number,
        tickLower: number,
        tickUpper: number,
        account: string,
        selectedPosition?: IPositionDetails,
    ): Promise<void> => {
        try {
            const pool = await useUniswapPool(provider);
            const position = Position.fromAmounts({
                pool,
                amount0: Math.round(usdtAmount * 10 ** ASSET_USDT.decimals),
                amount1: Math.round(lakeAmount * 10 ** ASSET_LAKE.decimals),
                tickLower: selectedPosition
                    ? selectedPosition.tickLower
                    : tickLower,
                tickUpper: selectedPosition
                    ? selectedPosition.tickUpper
                    : tickUpper,
                useFullPrecision: true,
            });

            const deadline = (
                new Date().getTime() / 1000 +
                transactionDeadline * 60
            )
                .toFixed()
                .toString();

            const { calldata, value } = selectedPosition
                ? NonfungiblePositionManager.addCallParameters(position, {
                      tokenId: selectedPosition.positionId,
                      slippageTolerance: new Percent(
                          slippageTolerance * 100,
                          10000,
                      ),
                      deadline,
                  })
                : NonfungiblePositionManager.addCallParameters(position, {
                      slippageTolerance: new Percent(
                          slippageTolerance * 100,
                          10000,
                      ),
                      recipient: account,
                      deadline,
                  });

            const txn: { to: string; data: string; value: string } = {
                to: nonfungiblePositionManagerAddress,
                data: calldata,
                value,
            };

            const gasLimit = await provider.getSigner().estimateGas(txn);
            const newTxn = {
                ...txn,
                gasLimit,
            };
            const resp = await provider.getSigner().sendTransaction(newTxn);
            await resp.wait();
        } catch (e) {
            console.error('Failed to provide liquidity', e);
        }
    };

    const removeLiquidity = async (
        account: string,
        positionDetails: IPositionDetails,
        percentage: number,
    ): Promise<void> => {
        try {
            const pool = await useUniswapPool(provider);
            const position = new Position({
                pool,
                liquidity: positionDetails.liquidity,
                tickLower: positionDetails.tickLower,
                tickUpper: positionDetails.tickUpper,
            });

            const deadline = (
                new Date().getTime() / 1000 +
                DEFAULT_TRANSACTION_DEADLINE * 60
            )
                .toFixed()
                .toString();

            const { calldata, value } =
                NonfungiblePositionManager.removeCallParameters(position, {
                    tokenId: positionDetails.positionId,
                    liquidityPercentage: new Percent(percentage, 100),
                    slippageTolerance: new Percent(1),
                    deadline,
                    collectOptions: {
                        expectedCurrencyOwed0: CurrencyAmount.fromRawAmount(
                            useUsdtToken(),
                            0,
                        ),
                        expectedCurrencyOwed1: CurrencyAmount.fromRawAmount(
                            useLakeToken(),
                            0,
                        ),
                        recipient: account,
                    },
                });

            const txn: { to: string; data: string; value: string } = {
                to: nonfungiblePositionManagerAddress,
                data: calldata,
                value,
            };

            const gasLimit = await provider.getSigner().estimateGas(txn);
            const newTxn = {
                ...txn,
                gasLimit,
            };
            const resp = await provider.getSigner().sendTransaction(newTxn);
            await resp.wait();
        } catch (e) {
            console.error('Failed to remove liquidity', e);
        }
    };

    return {
        getLakePrice,
        provideLiquidity,
        removeLiquidity,
    };
};
