import { useConfig } from '../hooks/use-config';

export const isPositionActive = (
    tokenA: string,
    tokenB: string,
    liquidity: number,
) => {
    const { getPool } = useConfig();
    const pool = getPool(tokenA, tokenB);
    return !!pool && pool.token0.address === tokenA && pool.token1.address === tokenB && liquidity > 0;
};
