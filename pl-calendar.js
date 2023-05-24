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
        }

        .weeks {
            margin:var(--space-sm) 0;
            display: grid;
            color: var(--text-color);
            font: var(--text-font);
            grid-template-columns: repeat(7, 1fr);
            gap: var(--space-sm);
        }

        .weeks span {
            width: var(--base-size-xxs);
            text-align: center;
        }

        .days {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            color: var(--text-color);
            font: var(--text-font);
            box-sizing: border-box;
            gap: var(--space-xs);
        }

        .days div {
            width: var(--base-size-sm);
            height: var(--base-size-sm);
            text-align: center;
            cursor: pointer;
            align-items: center;
            display: flex;
            justify-content: center;
            color: var(--grey-dark);
            visibility: hidden;
        }

        .days div[selected], .days div:hover {
            color: #fff !important;
            background: var(--primary-base);
            border-radius: var(--border-radius);
        }

        .days div[current]:not([disabled]):nth-child(7n-1), .days div[current]:not([disabled]):nth-child(7n)
        {
            color: var(--negative-base);
        }

        .weeks span:nth-child(7n-1), .weeks span:nth-child(7n)
        {
            color: var(--negative-base);
        }
        
        .days div[current] {
            color: var(--black-base);
            visibility: visible;
        }

        .days div[disabled] {
            color: var(--grey-light);
            cursor: not-allowed;
            pointer-events: none;
        }
    `;

    static template = html`
        <div class="weeks">
            <template d:repeat="[[_weekDays]]">
                <span>[[item]]</span>
            </template>
        </div>
        <div class="days">
            <template d:repeat="[[_days]]">
                <div on-click="[[onDayClick]]" selected$="[[item.selected]]" current$="[[item.current]]" disabled$="[[item.disabled]]">
                    [[item.formattedDay]]
                </div>
            </template>
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
