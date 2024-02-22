import { PlElement, html, css } from "polylib";

import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';

import dayjs from 'dayjs/esm/index.js';

class PlDateTimeYearSelector extends PlElement {
    static properties = {
        min: { type: Date, value: () => null },
        max: { type: Date, value: () => null },
        date: {type: Date, value: () => new Date()}
    };

    static css = css`
        :host{
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: var(--pl-space-sm);
            user-select: none;
        }
    `;

    static template = html`
        <pl-icon-button variant="link" icon="chevron-left" iconset="pl-default" on-click="[[_prevYear]]"></pl-icon-button>
        [[_format(date)]]
        <pl-icon-button variant="link" icon="chevron-right" iconset="pl-default"  on-click="[[_nextYear]]"></pl-icon-button>
    `;

    _format(date) {
        let dateVal = date || new Date();

        return dayjs(dateVal).format('YYYY')
    }

    _prevYear(){
        let dateVal = this.date || new Date();

        this.date = dayjs(dateVal).subtract(1, 'year').toDate();
    }

    _nextYear(){
        let dateVal = this.date || new Date();

        this.date = dayjs(dateVal).add(1, 'year').toDate();
    }
}

customElements.define('pl-datetime-year-selector', PlDateTimeYearSelector);