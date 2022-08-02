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
            gap: var(--space-sm);
            flex-direction: row;    
            text-align: center;
            user-select: none;
        }

        pl-icon{
            cursor: pointer;
            --pl-icon-fill-color: var(--grey-dark);
            height: 16px;
            width: 16px;
        }

        pl-icon:hover {
            --pl-icon-fill-color: var(--text-color);
        }
    `;

    static template = html`
        <pl-icon icon="chevron-left" iconset="pl-default" on-click="[[_prevYear]]"></pl-icon>
        <span>[[_format(date)]]</span>
        <pl-icon icon="chevron-right" iconset="pl-default" on-click="[[_nextYear]]"></pl-icon>
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