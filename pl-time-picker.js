import { PlElement, html, css } from "polylib";
import '@plcmp/pl-dom-if/pl-dom-if.js';

class PlTimePicker extends PlElement {
    static properties = {
        size: { type: Number, value: 192 },
        mode: { type: String, value: 'hours', observer: 'modeChanged' },
        sizeSmall: { type: Number, value: 192 - 56 },
        value: { type: String },
        _value: { type: Number, observer: '_valueObserver' },
        valueHour: { type: Number, observer: 'hourObserver' },
        valueMinute: { type: Number, observer: 'minuteObserver'  },
        _angle: { type: Number, value: -90 },
    }
    static css = css`
        :host {
            display: block;
            width: var(--nf-datetime-clock-size, 192px);
            height: var(--nf-datetime-clock-size, 192px);
            cursor: default;
        }
        .circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            /*color: #*/
            position: relative;
        }
        .number {
            position: absolute;
            width: 24px;
            height: 24px;
            left: calc(50% - 12px);
            top: calc(50% - 12px);
            text-align: center;
    
            cursor: pointer;
            pointer-events: none;
            user-select: none;
    
            font: var(--nf-font-md);
            color: var(--nf-black);
            line-height: 24px;
            border-radius: 50%;
        }
        .number:hover {
           color: var(--nf-black);
           background: var(--nf-gray);
        }
        .number[small] {
        }
        .number[selected] {
            font: var(--nf-font-bold-md);
             line-height: 23px;
        }
        .pointer {
            position: absolute;
            width: calc(50% - 1px);
            height: 2px;
            background-color: #5585B5;
            left: 50%;
            top: calc(50% - 1px);
            transform-origin: left center;
            pointer-events: none;
        }
        .pointer[small] {
            width: calc(50% - 29px);
        }
        .pointer[odd] {
            width: calc(50% - 20px);
        }
    
        .innerDot {
            position: absolute;
            background-color: #5585B5;
            top: -3px;
            left: -4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }
        .outerDot {
            position: absolute;
            box-sizing: content-box;
            border: 14px solid #BBE4EA;
            top: -13px;
            right: -1px;
            width: 0;
            height: 0;
            border-radius: 50%;
        }
        .outerDot[odd] {
            background: #ff1018;
            width: 0;
            height: 0;
            top: -5px;
            border-width: 6px;
        }
    
        [touching] {
            /*transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);*/
        }
    `;

    static template = html`<div class="circle"
                                on-touchmove="[[_handleTouchMove]]"
                                on-mousemove="[[_handleMouseMove]]"
                                on-touchstart="[[_disableAnimatedPointer]]"
                                on-mousedown="[[_disableAnimatedPointer]]"
                                on-touchend="[[_handleTouchEnd]]"
                                on-mouseup="[[_enableAnimatedPointer]]"
                                on-tap="[[_handleClick]]"
                                on-click="[[_handleClick]]"
                                on-mouseup="[[_partEnd]]">
        <div class="pointer" style$="[[getTransformRotate(_angle)]]" touching$="[[_touching]]"  small$="[[_isPointerSmall(mode, _value)]]" odd$="[[_isOdd(mode, _value)]]">
            <div class="innerDot"></div>
            <div class="outerDot" odd$="[[_isOdd(mode, _value)]]"></div>
        </div>

        <pl-dom-if if="[[_equal(mode, 'hours')]]" restamp>
            <template>
                <template d:repeat="[[_getNumbers('12', size)]]" d:as="digit">
                        <span
                                class="number"
                                selected$="[[_isSelected(digit.display,_value)]]"
                                style$="[[getTransform(digit.translateX,digit.translateY)]]"
                        >
                          [[digit.display]]
                        </span>
                </template>
                <template d:repeat="[[_getNumbers('12', sizeSmall, '12')]]" d:as="digit">
                        <span
                                class="number"
                                selected$="[[_isSelected(digit.display,_value)]]"
                                style$="[[getTransform(digit.translateX,digit.translateY)]]"
                                small
                        >
                          [[digit.display]]
                        </span>
                </template>
            </template>
        </pl-dom-if>
        <pl-dom-if is="dom-if" if="[[_equal(mode, 'minutes')]]" restamp>
            <template>
                <template d:repeat="[[_getNumbers('12', size, '0', '5')]]" d:as="digit">
                            <span
                                    class="number"
                                    selected$="[[_isSelected(digit.display,_value)]]"
                                    style$="[[getTransform(digit.translateX,digit.translateY)]]"
                            >
                              [[digit.display]]
                            </span>
                </template>
            </template>
        </pl-dom-if>
    </div>`;

    _isSelected(display, value) {
        return display === value;
    }

    _isPointerSmall(mode, value) {
        return mode === 'hours' && value >= 12;
    }

    _isOdd(mode, value) {
        return mode === 'minutes' && value % 5 !== 0;
    }

    _valueObserver(value, mode) {
        this._angle = this._getPointerAngle(value??0, this.mode);
    }
    hourObserver(h) {
        if (this.mode === 'hours') this._value = h;
    }
    minuteObserver(m) {
        if (this.mode === 'minutes') this._value = m;
    }
    _getNumbers(count, size, start = 0, step = 1) {
        count = +count;
        start = +start;
        step = +step;
        if (!count) return [];
        return Array(...Array(count)).map((_, i) => ({

            display: i * step + start,
            translateX: (size / 2 - 14) * Math.cos(2 * Math.PI * (i - 3) / count),
            translateY: (size / 2 - 14) * Math.sin(2 * Math.PI * (i - 3) / count),
        }));
    }

    _getPointerAngle(value, mode) {
        switch (mode) {
            case 'hours':
                return 360 / 12 * (value % 12 - 3);
            case 'minutes':
            default:
                return 360 / 60 * (value - 15);
        }
    }


    _getPointerValue(x, y, mode) {
        let angle = - Math.atan2(this.size / 2 - x, this.size / 2 - y) / Math.PI * 180;
        if (angle < 0) {
            angle = 360 + angle;
        }

        switch (mode) {
            case 'hours': {
                const radius = Math.sqrt(Math.pow(this.size / 2 - x, 2) + Math.pow(this.size / 2 - y, 2));
                let value = Math.round(angle * 12 / 360) % 12;
                if (radius < this.size / 2 - 32) {
                    value = value + 12;
                }
                return value === 24 ? 0 : value;
            }
            case 'minutes':
            default: {
                const value = Math.round( 60 * angle / 360) % 60;
                return value;
            }
        }
    }

    _disableAnimatedPointer() {
        this._touching = true;
    }

    _enableAnimatedPointer(e) {
        this._touching = false;
        e.preventDefault();
    }

    _movePointer(x, y) {
        this._value = this._getPointerValue(x, y, this.mode);
        if (this.mode === 'hours') {
            this.valueHour = this._value;
        } else if (this.mode === 'minutes') {
            this.valueMinute = this._value;
        }
    }

    _handleTouchMove(e) {
        e.preventDefault();
        const rect = e.target.getBoundingClientRect();
        this._movePointer(
            e.changedTouches[0].clientX - rect.left,
            e.changedTouches[0].clientY - rect.top,
        );
    }

    _handleMouseMove(e) {
        e.preventDefault();
        if (e.buttons === 1 || e.which === 1) {
            /*возвращает размер блока .circle и его позицию относительно вьюпорта*/
            const rect = e.target.getBoundingClientRect();
            this._movePointer(e.x - rect.left, e.y - rect.top);
        }
    }

    _handleTouchEnd(e) {
        this._handleTouchMove(e);
        this._enableAnimatedPointer();
    }

    _handleClick(e) {
        const rect = e.target.getBoundingClientRect();
        this._movePointer(e.x - rect.left, e.y - rect.top);
        this._partEnd();
    }

    _equal(a, b) {
        return b.split('|').some(item => item === a);
    }

    _decode(key, ...args) {
        let value;
        for (let i = 0, n = args.length; i < n; i += 2) {
            value = +args[i];
            const nextValue = +args[i + 1];
            if (+key === value && nextValue !== undefined) {
                value = nextValue;
                break;
            }
        }
        return value;
    }
    getTransform(x,y) {
        return `transform: translate(${x}px, ${y}px)`;
    }
    getTransformRotate(ang) {
        return `transform: rotate(${ang}deg)`;
    }
    _partEnd() {
        if (this.mode === 'hours') {
            this.valueHour = this._value;
            this.mode = 'minutes'
        } else if (this.mode === 'minutes') {
            this.valueMinute = this._value;
            this.mode = 'hours'
            this.dispatchEvent(new CustomEvent('done'))
        }
    }
    modeChanged(mode) {
        if (this.mode === 'hours') {
            this._value = this.valueHour;
        } else if (this.mode === 'minutes') {
            this._value = this.valueMinute;
        }
    }
}

customElements.define('pl-time-picker', PlTimePicker);