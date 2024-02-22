import { PlElement, html, css } from "polylib";
import '@plcmp/pl-repeat';

import dayjs from 'dayjs/esm/index.js';
import isoWeek from 'dayjs/esm/plugin/isoWeek/index.js';
import isSameOrBefore from 'dayjs/esm/plugin/isSameOrBefore/index.js';

dayjs.extend(isoWeek)
dayjs.extend(isSameOrBefore)

class PlCalendar extends PlElement {
    static properties = {
        selected: { value: () => null, observer: '_dateObserver' },
        date: { value: () => new Date(), observer: '_dateObserver' },
        min: { value: () => null, observer: '_dateObserver' },
        max: { value: () => null, observer: '_dateObserver' },
        restricted: { value: () => ([]), observer: '_dateObserver' },
        //TODO реализовать точки
        marked: { value: () => [], observer: '_dateObserver' },
        _weekDays: { value: () => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] },
        _days: { value: () => [] }
    }

    static css = css`
        :host {
            display: flex;
            flex-direction: column;
            user-select: none;
            box-sizing: border-box;
            color: var(--pl-text-color);
            font: var(--pl-text-font);
            text-align: center;
            gap: var(--pl-space-sm);
        }

        .weeks {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: var(--pl-space-sm);
        }

        .weeks div:nth-child(7n-1),
        .weeks div:nth-child(7n) {
            color: var(--pl-negative-base);
        }

        .days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: var(--pl-space-xs);
        }

        .days div {
            display: flex;
            width: calc(var(--pl-base-size) - 2px);
            height: calc(var(--pl-base-size) - 2px);
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: var(--pl-border-radius);
        }

        .days div:not([current]) {
            visibility: hidden;
        }

        .days div:nth-child(7n-1),
        .days div:nth-child(7n) {
            color: var(--pl-negative-base);
        }

        .days div[selected], 
        .days div:hover {
            color: var(--pl-background-color);
            background: var(--pl-primary-base);
        }

        .days div[disabled] {
            color: var(--pl-grey-light);
            cursor: not-allowed;
            pointer-events: none;
        }
    `;

    static template = html`
        <div class="weeks">
            <div d:repeat="[[_weekDays]]">[[item]]</div>
        </div>
        <div class="days">
            <div d:repeat="[[_days]]" on-click="[[onDayClick]]" selected$="[[item.selected]]" current$="[[item.current]]" disabled$="[[item.disabled]]">
                [[item.formattedDay]]
            </div>
        </div>
    `;
    
    _dateObserver(_dateVal) {
        this.splice('_days', 0, this._days.length);
        const date = dayjs(this.date).toDate();
        const monthStart = dayjs(this.date).startOf('month');
        const monthEnd = dayjs(this.date).endOf('month');
        const startDate = dayjs(monthStart).startOf('isoWeek');
        const endDate = dayjs(monthEnd).endOf('isoWeek');
        const dateFormat = "D";
        let day = startDate;
        let currentMonth = date.getMonth();
        while (day.isSameOrBefore(endDate, 'date')) {
            let disabled = false;
            disabled = day.isAfter(this.max, 'date') || day.isBefore(this.min, 'date') || this.restricted.some(x => dayjs(x).isSame(day, 'date'));
            const dayInfo = {
                day: day,
                formattedDay: day.format(dateFormat),
                current: currentMonth == day.month(),
                selected: new Date(this.selected)?.setHours(0,0,0,0) == day.toDate().setHours(0,0,0,0),
                disabled: disabled
            };
            this.push('_days', dayInfo);
            day = day.add(1, 'day')
        };
    }

    onDayClick(event) {
        this.dispatchEvent(new CustomEvent('on-day-click', { detail: { day: event.model.item.day }, bubbles: true, composed: true }))
    }
}

customElements.define('pl-calendar', PlCalendar);
