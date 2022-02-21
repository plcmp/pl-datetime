import { PlElement, html, css } from "polylib";

import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';

import dayjs from 'dayjs/esm/index.js';

class PlDateTimeYearSelector extends PlElement {
    static get properties() {
        return {
            min: { type: Date, value: () => null },
            max: { type: Date, value: () => null },
            date: {type: Date, value: () => new Date()}
        };
    }

    static get css() {
        return css`
            :host{
                display: flex;
                flex-direction: row;    
                gap: 8px; 
                text-align: center;
                user-select: none;
            }

            pl-icon{
				cursor: pointer;
                --pl-icon-fill-color: none;
                --pl-icon-stroke-color: var(--grey-dark);
            }

            pl-icon:hover {
                --pl-icon-stroke-color: var(--black-light);
			}
    	`;
    }

    static get template() {
        return html`
            <pl-icon icon="chevron-left" iconset="pl-default" on-click="[[_prevYear]]"></pl-icon>
            <span>[[_format(date)]]</span>
            <pl-icon icon="chevron-right" iconset="pl-default" on-click="[[_nextYear]]"></pl-icon>
        `;
    }

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