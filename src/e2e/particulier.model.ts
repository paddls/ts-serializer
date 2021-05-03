import {Driver} from './driver.model';
import {JsonTypeSupports} from '../decorator/json-type-supports.decorator';

@JsonTypeSupports((data: { type: 'PARTICULIER'|'PRO' }) => data.type === 'PARTICULIER')
export class Particulier extends Driver {
}
