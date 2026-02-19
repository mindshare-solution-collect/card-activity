import { useConfig } from '../hooks/use-config';

export const isPositionActive = (
    tokenA: string,
    tokenB: string,
    liquidity: number,
) => {
    const { wethAddress, lakeAddress } = useConfig();

    return (
        tokenA === wethAddress &&
        tokenB === lakeAddress &&
        liquidity > 0
    );
};