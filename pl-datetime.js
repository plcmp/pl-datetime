import { PlElement, html, css } from "polylib";

import '@plcmp/pl-input';
import '@plcmp/pl-input-mask';
import '@plcmp/pl-dropdown';
import '@plcmp/pl-icon';
import '@plcmp/pl-iconset-default';

import './pl-datetime-month-selector.js';
import './pl-datetime-year-selector.js';
import './pl-calendar.js';

import dayjs from 'dayjs/esm/index.js';
import customParseFormat from 'dayjs/esm/plugin/customParseFormat/index.js';

dayjs.extend(customParseFormat)

class PlDateTime extends PlElement {
    static get properties() {
        return {
            value: { observer: '_valueObserver' },
            label: { type: String },
            required: { type: Boolean },
            invalid: { type: Boolean },
            variant: { type: String },
            min: { value: () => null },
            max: { value: () => null },
            hidden: { type: Boolean, reflectToAttribute: true },
            restricted: { value: () => [] },
            _formatted: { type: String, observer: '_formattedObserver' },
            _dateMask: { type: String, value: 'DD.MM.YYYY' },
            _currentDate: { type: Date, value: new Date() },
            _blocks: { value: () => null }
        };
    }

    static get css() {
        return css`
            :host{
                --content-width: 140px;
                display: flex;
            }

            :host([hidden]) {
                display: none;
            }

            .header, .footer {
                display: flex;
                flex-direction: row;
                gap: 8px;
                justify-content: center;
            }

            .footer {
                margin-top: 8px;
            }

            .footer pl-button {
                width: 100%;
            }

			pl-icon {
				cursor: pointer;
			}

			pl-icon:hover {
				color: var(--black-light);
			}

            pl-dropdown {
                background: #FFFFFF;
                box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
                border-radius: 8px;
                box-sizing: border-box;
                padding: 12px;
            }
    	`;
    }

    static get template() {
        return html`
			<pl-input id="input" required="[[required]]" invalid="{{invalid}}" value="{{_formatted}}" label="[[label]]" variant="[[variant]]">
				<pl-icon slot="suffix" iconset="pl-default" size="16" icon="datetime" on-click="[[_onToggle]]"></pl-icon>
                <pl-input-mask id="inputMask" type="date" mask="[[_dateMask]]" blocks="[[_blocks]]"></pl-input-mask>
			</pl-input>
			<pl-dropdown id="dd">
                <div class="header">
                    <pl-datetime-month-selector date="{{_currentDate}}"></pl-datetime-month-selector>
                    <pl-datetime-year-selector date="{{_currentDate}}" min="[[min]]" max="[[max]]"></pl-datetime-year-selector>
                </div>
				<pl-calendar selected="[[value]]" restricted="[[restricted]]" min="[[min]]" max="[[max]]" date="[[_currentDate]]"></pl-calendar>
                <div class="footer">
                    <pl-button size="small" variant="secondary" label="[[_today()]]" on-click="[[onTodayClick]]"></pl-button>
                </div>
			</pl-dropdown>
		`;
    }

    onTodayClick() {
        this.value = new Date();
    }

    _today() {
        const date = new Date();
        return `Сегодня ${dayjs(date).format('DD.MM.YYYY')}`
    }

    _formattedObserver(formatted) {
        if (!this.$.inputMask._imask.masked) {
            return;
        }

        const date = dayjs(formatted, this._dateMask);
        this.invalid = !date.isValid();
        if (date.isValid()) {
            this.value = date.toDate();
        }
    }

    _valueObserver(value) {
        if (value) {
            this._currentDate = dayjs(value).toDate();
            const formatted = dayjs(value).format(this._dateMask);
            if (this._formatted != formatted) {
                this._formatted = formatted;
            }
        } else {
            this._formatted = null;
        }
    }

    connectedCallback() {
        super.connectedCallback();
        //TODO Доработать маску при частичном удалении

        this._nativeInput = this.$.input._nativeInput;
        this._calendarDropdown = this.$.dd;
        this.addEventListener('on-day-click', this._onDayClick);
        this.$.input.validators.push(this.validator.bind(this));
        this._calendarDropdown.addEventListener('wheel', (ev) => {
            ev.stopPropagation();
            if (ev.wheelDelta > 0) {
                this._currentDate = dayjs(this._currentDate).subtract(1, 'month');
            } else {
                this._currentDate = dayjs(this._currentDate).add(1, 'month');
            }
        });
    }

    _onToggle(event) {
        this._calendarDropdown.open(this.$.input._inputContainer);
    }

    validator(value) {
        let messages = [];
        if (!this.value) {
            return;
        }

        if (this.min && this.value.setHours(0, 0, 0, 0) < this.min.setHours(0, 0, 0, 0)) {
            messages.push(`The selected date cannot be less than the minimum: ${dayjs(this.min).format('DD.MM.YYYY')}`);
        }

        if (this.max && this.value.setHours(0, 0, 0, 0) > this.max.setHours(0, 0, 0, 0)) {
            messages.push(`The selected date cannot be greater than the maximum: ${dayjs(this.max).format('DD.MM.YYYY')}`);
        }

        return messages.length > 0 ? messages.join(';') : undefined;
    }

    _onDayClick(event) {
        event.stopPropagation()
        this.value = event.detail.day.toDate();
        this._calendarDropdown.close();
    }
}

customElements.define('pl-datetime', PlDateTime);