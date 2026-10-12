import {test} from '@playwright/test';
import {runFlight} from './flight-probe.js';
test.use({video:'off',trace:'off'});
test('native560ms Comment reaches peak landing and rebound with accepted Repost unchanged',async({page},info)=>runFlight(page,info,true));
