import { PlElement, html, css } from "polylib";
import '@plcmp/pl-icon-button';

import dayjs from 'dayjs/esm/index.js';

class PlDateTimeMonthSelector extends PlElement {
    static  properties = {
        date: { type: Date, value: () => null },
        _monthList: {
            type: Array,
            value: () => [
                'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
            ]
        },
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

    static  template = html`
        <pl-icon-button variant="link" icon="chevron-left" iconset="pl-default" on-click="[[_prevMonth]]"></pl-icon-button>
        [[_format(date)]]
        <pl-icon-button variant="link" icon="chevron-right" iconset="pl-default"  on-click="[[_nextMonth]]"></pl-icon-button>
    `;

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