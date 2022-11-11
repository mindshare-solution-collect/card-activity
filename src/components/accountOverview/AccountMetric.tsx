import { ReactNode } from 'react';
import { formatValue } from '../../utils/formatValue';

interface Props {
    title: string;
    value: number;
    icon: ReactNode;
    usdValue?: number;
    fontColor?: string;
}

export const AccountMetric = ({
    fontColor,
    title,
    icon,
    value,
    usdValue,
}: Props) => {
    return (
        <div className="w-full h-[6rem] flex justify-between pr-8 bg-black-700 rounded-[20px] inset-shadow">
            <div className="flex items-center justify-center px-4">{icon}</div>
            <div className="w-full flex items-center justify-between">
                <span
                    className={`max-w-[5.5rem] whitespace-wrap text-sm tracking-[.1em] text-center ${fontColor} mr-2`}
                >
                    {title}
                </span>
                <div className="flex items-center justify-center">
                    <div className="flex flex-col">
                        <div className="flex items-end">
                            <span
                                className={`${
                                    value >= 10 ** 6 ? 'text-base' : 'text-3xl'
                                } tracking-[.1em] color-gradient`}
                            >
                                {formatValue(Math.trunc(value), '', 0)}
                            </span>
                            <span
                                className={`${
                                    value >= 10 ** 6 ? 'text-xs' : 'text-base'
                                } tracking-[.1em] color-gradient`}
                            >
                                {Math.abs(value - Math.trunc(value))
                                    .toFixed(2)
                                    .slice(1)}
                            </span>
                        </div>
                        {!!usdValue && (
                            <span className="text-xs tracking-[.1em] text-gray-600 text-end">
                                {`( `}
                                {formatValue(usdValue, '$', 2)}
                                {` )`}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
