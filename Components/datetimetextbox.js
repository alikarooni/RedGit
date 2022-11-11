class DateTimeTextbox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();

        this.shadowRoot.querySelector('label').innerText = this.getAttribute('label');
        this.shadowRoot.querySelector('input').setAttribute('placeholder', this.getAttribute('placeholder'));
        this.shadowRoot.querySelector('#date').addEventListener('input', this.onDateInput.bind(this))
        this.shadowRoot.querySelector('#time').addEventListener('input', this.onTimeInput.bind(this))
        this.shadowRoot.datetimevalue = ''
    }
    onDateInput(e) {
        var date = this.shadowRoot.querySelector('#date')
        var time = this.shadowRoot.querySelector('#time')
        this.shadowRoot.datetimevalue = date.value + ' ' + time.value
        this.setAttribute('value', date.value + ' ' + time.value)
    }
    onTimeInput(e) {
        var date = this.shadowRoot.querySelector('#date')
        var time = this.shadowRoot.querySelector('#time')
        this.shadowRoot.datetimevalue = date.value + ' ' + time.value
        this.setAttribute('value', date.value + ' ' + time.value)
    }

    render() {
        this.shadowRoot.innerHTML = `
<style>
    .form-control {margin: 10px 0;}
    .form-control label {display: inline-block; width: 38%;clear: both; text-align: right;
        vertical-align: middle; line-height: 40px; margin-right: 2%;}
    #date {height: 40px; margin: 0px; padding: 2px 5px; font-size:14px;width:50%;
        border-width:1px;border-radius:.1rem;}
    #time {height: 40px; margin: 0px; padding: 2px 5px; font-size:14px;width:40%;
        border-width:1px;border-radius:.1rem;}
    .input{ width:60%; float: right;}    
</style>
<div class="form-control">
    <label id="lbl"></label>
    <div class="input">
        <input id="date" class="textbox" type="date" />
        <input id="time" class="textbox" type="time" />
    </div>   
</div>`
    }
}
window.customElements.define('datetime-textbox', DateTimeTextbox);