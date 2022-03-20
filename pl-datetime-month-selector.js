import { PlElement, html, css } from "polylib";

import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';

import dayjs from 'dayjs/esm/index.js';

class PlDateTimeMonthSelector extends PlElement {
    static get properties() {
        return {
            date: { type: Date, value: () => null },
            _monthList: {
                type: Array,
                value: () => [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ]
            },
        };
    }

    static get css() {
        return css`
            :host{
                display: flex;
                flex-direction: row;    
                gap: var(--space-sm);
                text-align: center;
                user-select: none;

            }

            .month {
                width: 75px;
            }

            pl-icon{
				cursor: pointer;
                --pl-icon-fill-color: var(--grey-dark);
            }

            pl-icon:hover {
                --pl-icon-fill-color: var(--text-color);
			}
    	`;
    }

    static get template() {
        return html`
            <pl-icon icon="chevron-left" iconset="pl-default" on-click="[[_prevMonth]]"></pl-icon>
            <span class="month">[[_format(date)]]</span>
            <pl-icon icon="chevron-right" iconset="pl-default"  on-click="[[_nextMonth]]"></pl-icon>
		`;
    }

    _format(date) {
        let dateVal = date || new Date();
        return this._monthList[dayjs(dateVal).toDate().getMonth()]
    }

    _prevMonth(){
        let dateVal = this.date || new Date();

        this.date = dayjs(dateVal).subtract(1, 'month').toDate();
    }

    _nextMonth(){
        let dateVal = this.date || new Date();

        this.date = dayjs(dateVal).add(1, 'month').toDate();
    }

}

customElements.define('pl-datetime-month-selector', PlDateTimeMonthSelector);