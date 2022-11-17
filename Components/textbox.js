class Textbox extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();

        this.shadowRoot.querySelector('label').innerText = this.getAttribute('label');
        this.shadowRoot.querySelector('input').setAttribute('placeholder', this.getAttribute('placeholder'));
        let textbox = this.shadowRoot.querySelector('input');
        textbox.addEventListener('change', this.onChange.bind(this));
        textbox.addEventListener('input', this.onInput.bind(this));
        this.shadowRoot.dataSources = this.getAttribute('dataSources') !== null ?
            this.getAttribute('dataSources').split(",") : [];

        this.shadowRoot.querySelector('.input').addEventListener('focusout', this.onFocusOut.bind(this), true)

        this.nextEvent.bind(this)
        this.onFocusOut.bind(this)
        this.importDataSource.bind(this)
        this.setOnChangeCallback.bind(this)
        this.setValue.bind(this)
        this.createUlList(this.shadowRoot.dataSources)

    }
    importDataSource(list) {
        if (this.shadowRoot.dataSources === undefined || this.shadowRoot.dataSources.length === 0) {
            this.shadowRoot.dataSources = list
        }
        else {
            list.forEach(x => this.shadowRoot.dataSources.push(x))
        }
    }
    setOnChangeCallback(callback) {
            this.shadowRoot.onchangeCallbackcallback = callback
    }
    createUlList(list) {
        let ul = this.shadowRoot.querySelector('ul')
        ul.innerHTML = ''
        for (var i = 0; i < list.length; i++) {
            let li = document.createElement('li')
            li.appendChild(document.createTextNode(list[i].name.trim()))
            li.addEventListener('click', this.liClick.bind(this), true)
            li.setAttribute('value', list[i].name.trim());
            li.setAttribute('key', list[i].id);
            ul.appendChild(li)
        }

        ul.setAttribute('hidden', 'hidden')
    }
    liClick(e) {
        if (this.eventQueue === undefined) {
            this.eventQueue = [{ 'sender': 'li', 'key': e.currentTarget.getAttribute('key'), 'value': e.currentTarget.getAttribute('value') }]
            this.eventLoader = setTimeout(this.nextEvent, 200, this)
        }
        else {
            this.eventQueue.push({ 'sender': 'li', 'key': e.currentTarget.getAttribute('key'), 'value': e.currentTarget.getAttribute('value') });
        }
    }
    onInput(e) {
        this.createUlList(this.shadowRoot.dataSources.filter(x => x.name.toLowerCase().includes(e.target.value.toLowerCase())).slice(0, 15))
        this.shadowRoot.querySelector(".listbox").removeAttribute('hidden')        
    }
    async onChange(e) {
        let str = e.target.value
        this.setAttribute('text', str);
        await new Promise(r => setTimeout(r, 300));
        if (str.length == 0 || this.shadowRoot.dataSources.filter(x => x == str).length == 1)
            this.shadowRoot.querySelector(".listbox").setAttribute('hidden', 'hidden')

        if (this.shadowRoot.onchangeCallbackcallback !== undefined)
            this.shadowRoot.onchangeCallbackcallback()
    }
    setValue(txt) {
        this.shadowRoot.querySelector('input').value = txt
    }
    onFocusOut(e) {
        if (this.eventQueue === undefined) {
            this.eventQueue = [{ 'sender': 'div', 'key': e.currentTarget.getAttribute('key'), 'value': e.currentTarget.getAttribute('value')  }]
            this.eventLoader = setTimeout(this.nextEvent, 200, this)
        }
        else {
            this.eventQueue.push({ 'sender': 'div', 'key': e.currentTarget.getAttribute('key'), 'value': e.currentTarget.getAttribute('value') });
        }
    }
    nextEvent(self) {
        if (self.eventQueue !== undefined && self.eventQueue.length > 0) {
            const li = self.eventQueue.filter(x => x.sender === 'li')
            if (li !== undefined && li.length > 0) {
                const key = li[0].key;
                const value = li[0].value;
                self.shadowRoot.querySelector('input').value = value; 
                self.shadowRoot.querySelector('input').setAttribute('key', key); 
                self.setAttribute('key', key) 
                self.setAttribute('text', value) 
                self.shadowRoot.querySelector(".listbox").setAttribute('hidden', 'hidden')
            }

            const div = self.eventQueue.filter(x => x.sender === 'div')
            if (div !== undefined && div.length > 0) {
                const e = div[0].object;
                self.shadowRoot.querySelector(".listbox").setAttribute('hidden', 'hidden')
            }
        }

        self.eventQueue = undefined;
        self.eventLoader = null;
    }
    render() {
        this.shadowRoot.innerHTML = `
<style>
    .form-control {margin: 10px 0;}
    .form-control label {display: inline-block; width: 38%;clear: both; text-align: right;
        vertical-align: middle; line-height: 30px; margin-right: 2%; margin-top:6px;}
    .textbox {height: 40px; margin: 0px; padding: 2px 5px; font-size: 14px;width:95%;
        border-width:1px;border-radius:.1rem;}
    .listbox{ border: 1px solid black;font-size: 14px; margin: 0px; position: absolute;
            width:55%; background-color:white;padding:3px 7px;z-index:20;}
    .input{ width:60%; float: right;}
    .input li{ list-style: none; padding:3px 0; }
    .input li:hover{ background-color:#ccc;}
</style>
<div class="form-control">
    <label id="lbl"></label>
    <div class="input">
        <input id="txt" class="textbox" type="text" />
        <ul class="listbox">
        </ul>
    </div>   
</div>`
    }
}
window.customElements.define('text-box', Textbox);