import { PlElement, html, css } from "polylib";

import '@plcmp/pl-input';
import '@plcmp/pl-input-mask';
import '@plcmp/pl-dropdown';
import '@plcmp/pl-icon';
import '@plcmp/pl-icon-button';
import '@plcmp/pl-iconset-default';

import './pl-datetime-month-selector.js';
import './pl-datetime-year-selector.js';
import './pl-calendar.js';
import './pl-time-picker.js';

import dayjs from 'dayjs/esm/index.js';
import customParseFormat from 'dayjs/esm/plugin/customParseFormat/index.js';

dayjs.extend(customParseFormat)

const TYPES = {
    date: { mask: 'DD.MM.YYYY' },
    datetime: { mask: 'DD.MM.YYYY HH:mm'}
}

class PlDateTime extends PlElement {
    static  properties = {
        value: { observer: '_valueObserver' },
        label: { type: String },
        required: { type: Boolean },
        invalid: { type: Boolean },
        orientation: { type: String },
        contentWidth: { type: Number },
        labelWidth: { type: Number },
        min: { value: () => null, observer: '_minObserver' },
        max: { value: () => null, observer: '_maxObserver' },
        hidden: { type: Boolean, reflectToAttribute: true },
        disabled: { type: Boolean, reflectToAttribute: true },
        restricted: { value: () => [] },
        _formatted: { type: String, observer: '_formattedObserver' },
        _hour: { type: Number, observer: '_hourChanged', value: 0 },
        _minute: { type: Number, observer: '_minuteChanged', value: 0 },
        _dateMask: { type: String },
        _currentDate: { type: Date, value: new Date() },
        _timepickerMode: { type: String },
        _ddOpened: { type: Boolean },
        type: { type: String, value: 'date', observer: '_typeChanged', reflectToAttribute: true } ,// date/datetime
        readonly: { type: Boolean },
        fitInto: { type: Object },
        stretch: { type: Boolean, reflectToAttribute: true }
    }

    static css = css`
        :host {
            display: inline-block;
        }

        :host([hidden]) {
            display: none;
        }

        :host([type=date]){
            --pl-content-width: 145px;
        }
        :host([type=datetime]){
            --pl-content-width: 185px;
        }

        :host([stretch]) {
            width: 100%;
            flex-shrink: 1;
            --pl-content-width: 100%;
        }

        .header, .footer {
            display: flex;
            flex-direction: row;
            justify-content: center;
            height: var(--pl-base-size);
        }

        :host([disabled]) pl-icon-button {
            pointer-events: none;
        }

        pl-dropdown {
            background: var(--pl-surface-color);
            box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
            border-radius: var(--pl-border-radius);
            box-sizing: border-box;
            padding: var(--pl-space-md);
        }

        pl-dropdown::part(popover) {
            background: var(--pl-surface-color);
            box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
            border-radius: var(--pl-border-radius);
            box-sizing: border-box;
            padding: var(--pl-space-md);
        }
        
        .hf {
            display: flex;
        }
        
        .pc {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
    `;

    static  template = html`
        <pl-input exportparts="labeled-container,label,input-container,native-input" stretch="[[stretch]]" content-width="[[contentWidth]]" label-width="[[labelWidth]]" readonly="[[readonly]]" id="input" required="[[required]]" invalid="{{invalid}}" value="{{_formatted}}" label="[[label]]" orientation="[[orientation]]" disabled="[[disabled]]">
            <slot name="prefix" slot="prefix"></slot>
            <slot name="suffix" slot="suffix"></slot>
            <pl-icon-button variant="link" hidden="[[isClearHidden(readonly, value)]]" slot="suffix" iconset="pl-default" size="12" icon="close" on-click="[[_clear]]"></pl-icon-button>
            <pl-icon-button variant="link" hidden="[[readonly]]" slot="suffix" iconset="pl-default" size="16" icon="[[_getIcon(type)]]" on-click="[[_onToggle]]"></pl-icon-button>
            <pl-input-mask id="inputMask" type="date" mask="[[_dateMask]]"></pl-input-mask>
        </pl-input>
        <pl-dropdown id="dd">
            <pl-dom-if if="[[_ddOpened]]">
                <template>
                    <div class="hf">
                        <div>
                            <div class="header">
                                <pl-datetime-month-selector date="{{_currentDate}}"></pl-datetime-month-selector>
                                <pl-datetime-year-selector date="{{_currentDate}}" min="[[min]]" max="[[max]]"></pl-datetime-year-selector>
                            </div>
                            <pl-calendar selected="[[value]]" restricted="[[restricted]]" min="[[min]]" max="[[max]]" date="[[_currentDate]]"></pl-calendar>
                        </div>
                        <pl-dom-if if="[[_eq(type,'datetime')]]">
                            <template>
                            <div class="pc">
                                <span>[[_pad2(_hour)]]:[[_pad2(_minute)]]</span>
                                <pl-time-picker value-hour="{{_hour}}" value-minute="{{_minute}}" on-done="[[timeDone]]" mode="{{_timepickerMode}}"></pl-time-picker>
                            </div>
                            </template>
                        </pl-dom-if>
                    </pl-dom-if>
                    </div>
                    <div class="footer">
                        <pl-button variant="link" label="[[_today()]]" on-click="[[onTodayClick]]"></pl-button>
                    </div>
                </template>
        </pl-dropdown>
    `;

    _minObserver() {
        this.$.input.validate();
    }

    _maxObserver() {
        this.$.input.validate();
    }

    _getIcon(type) {
        return type;
    }

    isClearHidden(){
        return this.readonly || !this.value;
    }

    onTodayClick() {
        this.$.input.value = dayjs().format(this._dateMask);
        this.$.dd.close();
    }

    _today() {
        return `${this.type == 'datetime' ? 'Сейчас' : 'Сегодня'}`
    }

    _formattedObserver(formatted) {
        this.$.inputMask._imask.value = formatted;
        this._internalSet = true;
        if (this.$.inputMask._imask.masked && this.$.inputMask._imask.masked.isComplete) {
            const date = dayjs(formatted, this._dateMask);
            this.invalid = !date.isValid();
            if (date.isValid()) {
                if (!date.isSame(this.value)) this.value = date.toDate();
            } else {
                this.value = null;
            }
        } else {
            this.value = null;
        }
        this._internalSet = false;
    }

    _valueObserver(value,_,m) {
        if (value) {
            let dv = dayjs(value);
            this._currentDate = dv.toDate();
            const formatted = dv.format(this._dateMask);
            //if (dv.hour() !== this._hour)
                this._hour = +dv.format('HH');
            //if (dv.minute() !== this._minute)
                this._minute = +dv.format('mm');
            if (this._formatted != formatted) {
                this._formatted = formatted;
            }
        } else {
            if (!this._internalSet)
                this._formatted = '';
        }
    }
    _minuteChanged(v,o) {
        this._timeSelected = true;
        if (this.value && dayjs(this.value).minute() !== +v)
            this.value = dayjs(this.value).set('minute', v).toDate();
    }
    _hourChanged(v,o) {
        this._timeSelected = true;
        if (this.value && dayjs(this.value).hour() !== +v)
            this.value = dayjs(this.value).set('hour', v).toDate();
    }
    connectedCallback() {
        super.connectedCallback();
        //TODO Доработать маску при частичном удалении

        this.addEventListener('on-day-click', this._onDayClick);
        this.$.input.validators.push(this.validator.bind(this));
        //TODO: move to calendar
        this.$.dd.addEventListener('wheel', (ev) => {
            ev.stopPropagation();
            if (ev.wheelDelta > 0) {
                this._currentDate = dayjs(this._currentDate).subtract(1, 'month');
            } else {
                this._currentDate = dayjs(this._currentDate).add(1, 'month');
            }
        });
        this._typeChanged(this.type);
    }

    _typeChanged(t) {
        this._dateMask = TYPES[t]?.mask ?? 'DD.MM.YYYY';
    }
    _onToggle(event) {
        if (this.$.dd.opened) {
            this.$.dd.close();
        } else {
            if (this.type === 'datetime') {
                this._timepickerMode = 'hours';
                this._timeSelected = false;
                this._daySelected = false;
                this._PrevDaySelected = null;
            }
            this.$.dd.open(this.$.input.$.inputContainer, this.fitInto);
            this._ddOpened = true;
        }
    }

    validator(value) {
        let messages = [];
        if (!this.value) {
            return;
        }
        let dateMode = this.type === 'date';
        let v = dayjs(this.value);
        if (dateMode) v = v.startOf('day');
        if (this.min && v.isBefore( dateMode ? dayjs(this.min).startOf('day') : this.min)) {
            messages.push(`The selected date cannot be less than the minimum: ${dayjs(this.min).format('DD.MM.YYYY')}`);
        }

        if (this.max && v.isAfter( dateMode ? dayjs(this.max).startOf('day') : this.max)) {
            messages.push(`The selected date cannot be greater than the maximum: ${dayjs(this.max).format('DD.MM.YYYY')}`);
        }

        return messages.length > 0 ? messages.join(';') : undefined;
    }

    _onDayClick(event) {
        event.stopPropagation();
        this._daySelected = true;
        let day = dayjs(event.detail.day).hour(+(this._hour??0)).minute(+(this._minute??0));
        this.$.input.value = day.format(this._dateMask);
        if (this.type === 'date' || this._timeSelected || event.detail.day.isSame(this._PrevDaySelected) )
        this.$.dd.close();

        this._PrevDaySelected = event.detail.day;
    }
    timeDone() {
        if (this._daySelected) this.$.dd.close();
    }
    _eq(a,b) {
        return a === b;
    }
    _pad2(x) {
        return (x ?? 0).toString().padStart(2,'0');
    }
    _clear() {
        this.$.inputMask._imask.updateValue();
        this._formatted = '';
    }
}

customElements.define('pl-datetime', PlDateTime);