import {test} from '@playwright/test';
import {runFlight} from './flight-probe.js';
test.use({video:{mode:'on',size:{width:960,height:720}}});
test('recorded Comment grows rises descends and restores while accepted Repost plays unchanged',async({page},info)=>runFlight(page,info,false));
