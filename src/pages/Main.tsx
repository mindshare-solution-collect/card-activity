import { AccountOverview } from '../components/accountOverview/AccountOverview';
import { Footer } from '../components/footer/Footer';
import { Page } from '../components/page/Page';
import { Stats } from '../components/stats/Stats';
import { VestingOverview } from '../components/vestingOverview/VestingOverview';
import { Widgets } from '../components/widgets/Widgets';

export const Main = () => (
    <Page>
        <div className="w-full flex flex-col items-center justify-center px-28">
            <div className="w-full h-[85vh] flex justify-between pt-14 pb-6">
                <div className="w-[66%]">
                    <AccountOverview />
                </div>
                <div className="w-[31%]">
                    <Stats />
                </div>
            </div>
            <div className="w-full h-[82vh] py-6">
                <Widgets />
            </div>
            <div className="w-full h-[80vh] py-6">
                <VestingOverview />
            </div>
            <div className="w-full h-[35vh] pt-6 pb-14">
                <Footer />
            </div>
        </div>
    </Page>
);
