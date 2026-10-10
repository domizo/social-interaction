import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';
afterEach(cleanup);
// DOM unit tests do not replace native-dialog browser QA.
HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');this.querySelector<HTMLElement>('[autofocus],textarea,button')?.focus();};
HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
