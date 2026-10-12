import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {defaultTokens} from '../src/lib/index.js';
import {contrastRatio,minimumAccentContrast} from '../src/app/Inspector.js';
describe('default accent small-text contrast',()=>{
 it.each(['#ffffff','#faf1f2','#f6e3e6','#fff7f7'])('meets4.5:1 on actual base/hover surface %s',surface=>{expect(contrastRatio(defaultTokens.accent,surface)).toBeGreaterThanOrEqual(4.5);});
 it('detects a color that passes white but fails hovered Soft',()=>{expect(contrastRatio('#c83f4b','#ffffff')).toBeGreaterThan(4.5);expect(minimumAccentContrast('#c83f4b')).toBeLessThan(4.5);});
});

it('new motion helper text remains readable on white and control surfaces',()=>{const css=readFileSync('src/app/styles.css','utf8').split('.motion-lab{')[1];const colors=[...css.matchAll(/(?<![-\w])color:(#[0-9a-f]{6})/g)].map(m=>m[1]);expect(colors.length).toBeGreaterThan(3);for(const color of colors)for(const surface of ['#ffffff','#f5f6f8','#fbfcfd'])expect(contrastRatio(color,surface),`${color} on ${surface}`).toBeGreaterThanOrEqual(4.5);});

it('workflow small text and tab numbers meet contrast on their actual surfaces',()=>{
 const css=readFileSync('src/app/workflow.css','utf8');
 const selectors=['.workflow-version','.export-summary li>code','.export-summary li:before'];
 for(const selector of selectors){const body=css.slice(css.indexOf(selector+'{')).split('}')[0];const color=body.match(/(?<![-\w])color:(#[0-9a-f]{6})/)?.[1];expect(color).toBeTruthy();expect(contrastRatio(color!,'#ffffff')).toBeGreaterThanOrEqual(4.5);}
 const number=css.slice(css.indexOf('.workflow-tab-number{')).split('}')[0];expect(number).not.toMatch(/opacity:/);expect(number).toContain('color:inherit');expect(contrastRatio('#586472','#ffffff')).toBeGreaterThanOrEqual(4.5);expect(contrastRatio('#ffffff','#282b2f')).toBeGreaterThanOrEqual(4.5);
});
