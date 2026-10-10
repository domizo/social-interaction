import {describe,it,expect} from 'vitest';
import {defaultTokens} from '../src/lib/index.js';
import {contrastRatio,minimumAccentContrast} from '../src/app/Inspector.js';
describe('default accent small-text contrast',()=>{
 it.each(['#ffffff','#faf1f2','#f6e3e6','#fff7f7'])('meets4.5:1 on actual base/hover surface %s',surface=>{expect(contrastRatio(defaultTokens.accent,surface)).toBeGreaterThanOrEqual(4.5);});
 it('detects a color that passes white but fails hovered Soft',()=>{expect(contrastRatio('#c83f4b','#ffffff')).toBeGreaterThan(4.5);expect(minimumAccentContrast('#c83f4b')).toBeLessThan(4.5);});
});
